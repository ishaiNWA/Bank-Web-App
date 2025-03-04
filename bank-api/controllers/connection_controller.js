const {
  mongoose,
  findUserByEmail,
  deletePendingUserByEmail,
  createPendingUser,
  findAndDeletePendingUser,
  createUser,
  createManagerInvitation,
  findManagerInvitationByEmail,
} = require("../database/DB_operations");

const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const validator = require("email-validator");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/*****************************************************************************/

async function validateRegistrationDetails(req, res, next) {
  const { name, userEmail, password } = req.body;

  try {
    validateUserInputsFormat(password, userEmail, name);
  } catch (error) {
    sendResponse(res, 400, error.message, null, null);
    return;
  }

  try {
    if (await isUserNameExisted(userEmail)) {
      sendResponse(
        res,
        400,
        "email address already existed in system",
        null,
        null
      );
      return;
    }
  } catch (error) {
    sendResponse(res, 500, "internal error", "error", error);
  }
  next();
}

/*****************************************************************************/

function validateUserInputsFormat(password, userEmail, name = null) {
  if (!password || !isValidPasswordFormat(password)) {
    throw new Error("invalid password format");
    return;
  }
  if (!userEmail || !validator.validate(userEmail)) {
    throw new Error("invalid email format");
  }
  if (name) {
    if (!isValidName(name)) {
      throw new Error("name should be 1-20 only upper/lower case letters");
      return;
    }
  }
}
/*****************************************************************************/

async function isUserNameExisted(userEmail) {
  return !!(await findUserByEmail(userEmail));
}

/*****************************************************************************/
function isValidName(name) {
  const nameRegex = /^[a-zA-Z]{1,20}$/;
  return nameRegex.test(name);
}

/*****************************************************************************/

function isValidPasswordFormat(password) {
  console.log("password is :" + password);
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,20}$/;
  return passwordRegex.test(password);
}
/*****************************************************************************/

async function registerPendingUser(req, res, next) {
  let session;
  let generatedPassword;
  try {
    generatedPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await hashingThePassword(req.body.password, salt);

    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await deletePendingUserByEmail(req.body.userEmail, session); //confirm no duplication created

      await createPendingUser(
        {
          name: req.body.name,
          confirmationPassword: generatedPassword,
          userEmail: req.body.userEmail,
          userHashedPassword: hashedPassword,
        },
        session
      );
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "internal error", "error", error);

    return;
  } finally {
    if (session) {
      await session.endSession();
    }
  }

  req.code = generatedPassword;
  req.emailText = `Please resend this registration confirmation code: ${generatedPassword} to ...`;
  // The "..." part will be added later
  sendConfirmationEmail(res, req, next);
}

/*****************************************************************************/

function sendConfirmationEmail(req, res, next) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: req.body.userEmail,
    subject: "👋 Hello from Node.js 🚀",
    text: req.emailText,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error:", error.message);
      sendResponse(
        res,
        500,
        `confirmation mail sending failure with ${+error.messages}`,
        "error",
        error
      );
    } else {
      console.log("✅ Email sent:", info.response);
      sendResponse(res, 200, "confirmation mail sent", "mail info", info);
    }
  });
}

/*****************************************************************************/

async function verifyConfirmationPassword(req, res, next) {
  let status;
  let statusExplanation;
  const minSubmitionTime = new Date(Date.now() - 60 * 15 * 1000); //ten minuts limit
  try {
    const validPendingUser = await findAndDeletePendingUser(
      req.body.confirmationPassword,
      minSubmitionTime
    );

    if (!validPendingUser) {
      status = 400;
      statusExplanation =
        "no matching confirmation password or pendig state has expired." +
        " check if correct password was inserted, or register again and confirm password within " +
        " the 10 minuts limit";
      sendResponse(res, status, statusExplanation, null, null);
    } else {
      req.pendingUser = validPendingUser;
      next();
    }
  } catch (error) {
    sendResponse(res, 500, "internal error", "error", error);
  }
}

/*****************************************************************************/

async function registerUser(req, res, next) {
  try {
    await createUser({
      name: req.pendingUser.name,
      email: req.pendingUser.userEmail,
      hashedPassword: req.pendingUser.userHashedPassword,
    });

    sendResponse(res, 200, "user has been successfully registered", null, null);
  } catch (error) {
    console.log(error);
    sendResponse(res, 400, "registration error", "error", error);
  }
}

/*****************************************************************************/

async function verifyLoginCredentials(req, res, next) {
  const { userEmail, password } = req.body;
  let registeredUser = null;

  try {
    validateUserInputsFormat(password, userEmail);
  } catch (error) {
    sendResponse(res, 400, error.message, null, null);
    return;
  }

  try {
    registeredUser = await findUserByEmail(userEmail);
    if (!registeredUser) {
      sendResponse(res, 401, "wrong email", null, null);
      return;
    }

    if (!(await bcrypt.compare(password, registeredUser.hashedPassword))) {
      sendResponse(res, 401, "wrong password", null, null);
      return;
    }
  } catch (error) {
    sendResponse(res, 500, "internal error", "error", error);
    return;
  }

  req.extractedRole = registeredUser.role;
  next();
}

/*****************************************************************************/

async function hashingThePassword(unHashedPassword, salt) {
  // Hash the password with the generated salt
  return await bcrypt.hash(unHashedPassword, salt);
}

/*****************************************************************************/

async function inviteManagerMember(req, res, next) {
  generatedToken = Math.random().toString(36).slice(-8);
  const salt = await bcrypt.genSalt(10);
  const hashedToken = await hashingThePassword(generatedToken, salt);

  const invitedMemberObj = {
    name: req.body.userName,
    email: req.body.userEmail,
    role: "manager",
    hashedToken: hashedToken,
  };
  await createManagerInvitation(invitedMemberObj);

  req.code = generatedToken;
  req.emailText = `This is your manager registration code: ${generatedToken}
  Please send this code along with your credentials to... `;
  // The "..." part will be added later
  sendConfirmationEmail(req, res, next);
}

/*****************************************************************************/

async function registerManager(req, res, next) {
  const managerInvDoc = await findManagerInvitationByEmail(email);

  if (
    managerInvDoc &&
    (await bcrypt.compare(managerInvDoc.hashedToken, req.token))
  ) {
    generatedPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await hashingThePassword(req.body.password, salt);

    createUser({
      name: managerInvDoc.name,
      email: managerInvDoc.email,
      role: managerInvDoc.role,
      hashedPassword: hashedPassword,
    });
  }
}

/*****************************************************************************/
function sendResponse(res, resStatus, responseExplanation, dataKey, dataValue) {
  const responseBody = {
    explanation: responseExplanation,
  };
  if (dataKey) {
    responseBody[dataKey] = dataValue;
  }
  res.status(resStatus).json(responseBody);
}

/*****************************************************************************/

module.exports = {
  validateRegistrationDetails,
  registerPendingUser,
  verifyConfirmationPassword,
  registerUser,
  verifyLoginCredentials,
  inviteManagerMember,
  registerManager,
};
