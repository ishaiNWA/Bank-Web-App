const {
  mongoose,
  findUserByEmail,
  deletePendingUserByEmail,
  createPendingUser,
  findAndDeletePendingUser,
  createUser,
  createManagerInvitation,
  findManagerInvitationByEmail,
  executeWithTransaction,
  deleteManagerInvitationByEmail,
} = require("../services/db-service");

const sendMail = require("../services/mail-service");
const getServerIP = require("../services/os-service");
const USER_ROLES = require("../constants/roles");
const bcrypt = require("bcrypt");
const validator = require("email-validator");

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
      sendResponse(res, 400, "email address already existed in system", null, null);
      return;
    }
  } catch (error) {
    sendResponse(res, 500, "internal error", "error", error);
    return;
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
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,20}$/;
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

  const mailOptions = {
    to: req.body.userEmail,
    subject: "user register confirmation code",
    text: `Please send this code to http://${getServerIP()}:${process.env.PORT}/api/connection/register-confirmation
Your code is: ${req.code}
Thank you for registering with our service.`,
  };

  sendMail(
    mailOptions,
    (info) => {
      console.log("✅ Email sent:", info.response);
      sendResponse(res, 200, "mail sent", "mail info", info);
    },
    (error) => {
      console.error("❌ Error:", error.message);
      sendResponse(res, 500, `mail sending failure with ${+error.messages}`, "error", error);
    }
  );
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
    role: USER_ROLES.MANAGER,
    hashedToken: hashedToken,
  };

  try {
    executeWithTransaction(async (session) => {
      //ensure no duplication of ManagerInvitation document
      await deleteManagerInvitationByEmail(req.body.userEmail, session);
      await createManagerInvitation(invitedMemberObj, session);
    });
  } catch (error) {
    sendResponse(res, 500, "internal error", "error", error);
  }

  req.code = generatedToken;

  const mailOptions = {
    to: req.body.userEmail,
    subject: "manager invitation code",
    text: `Please send your email along with this code to http://${getServerIP()}:${process.env.PORT || 3000}/api/connection/register-manager
Your code is: ${req.code}
Thank you for registering with our service.`,
  };

  sendMail(
    mailOptions,
    (info) => {
      console.log("✅ Email sent:", info.response);
      sendResponse(res, 200, "mail sent", "mail info", info);
    },
    (error) => {
      console.error("❌ Error:", error.message);
      sendResponse(res, 500, `mail sending failure with ${+error.messages}`, "error", error);
    }
  );
}

/*****************************************************************************/

async function validateManagerInvitation(req, res, next) {
  let managerInvDoc;
  try {
    managerInvDoc = await findManagerInvitationByEmail(req.body.userEmail);
  } catch (error) {
    sendResponse(res, 500, "internal error", "error", error);
    return;
  }

  if (!managerInvDoc || !(await bcrypt.compare(req.body.token, managerInvDoc.hashedToken))) {
    sendResponse(
      res,
      403,
      "Invalid invitation or token. Please retry again with correct credentials or request a new invitation link."
    );
    return;
  }
  req.managerInvDoc = managerInvDoc;
  next();
}

/*****************************************************************************/

async function registerManager(req, res, next) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await hashingThePassword(req.body.password, salt);
  const managerInvDoc = req.managerInvDoc;

  try {
    await executeWithTransaction(async (session) => {
      await deleteManagerInvitationByEmail(managerInvDoc.email, session);
      await createUser(
        {
          name: managerInvDoc.name,
          email: managerInvDoc.email,
          role: managerInvDoc.role,
          hashedPassword: hashedPassword,
        },
        session
      );
    });
    sendResponse(res, 200, "A manager-role user has been successfully registered", null, null);
  } catch (error) {
    sendResponse(res, 500, "internal error", "error", error);
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
  validateManagerInvitation,
  registerManager,
};
