const {
  mongoose,
  findUserByEmail,
  deletePendingUserByEmail,
  createPendingUser,
  findAndDeletePendingUser,
  createUser,
} = require("../database/DB_operations");

const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
var validator = require("email-validator");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/*****************************************************************************/

async function validateRegistrationDetails(req, res, next) {
  const { name, userEmail } = req.body;

  if (!isValidName(name)) {
    sendResponse(
      res,
      400,
      "name should be 1-20 only upper/lower case letters",
      null,
      null,
    );
    return;
  }

  if (!userEmail || !validator.validate(userEmail)) {
    sendResponse(res, 400, "invalid email format", null, null);
    return;
  }

  try {
    if (await isUserNameExisted(userEmail)) {
      sendResponse(
        res,
        400,
        "email address already existed in system",
        null,
        null,
      );
      return;
    }
  } catch (error) {
    sendResponse(res, 500, "internal error", "error", error);
  }
  next();
}

/*****************************************************************************/

async function isUserNameExisted(userEmail) {
  return !!(await findUserByEmail(userEmail));
}

/*****************************************************************************/
function isValidName(name) {
  let nameRegex = /^[a-zA-Z]{1,20}$/;
  return nameRegex.test(name);
}

/*****************************************************************************/

async function savePendingUser(req, res, next) {
  let session;
  try {
    const generatedPassword = Math.random().toString(36).slice(-8);
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
          userHashedPassword: hashedPassword, // You need to provide this
          salt: salt,
        },
        session,
      );
    });
  } catch (error) {
    sendResponse(res, 500, "internal error", "error", error);
    console.log(error);
    return;
  } finally {
    if (session) {
      await session.endSession();
    }
  }

  req.confirmationPassword = generatedPassword;
  next();
}

/*****************************************************************************/

function sendConfirmationEmail(req, res, next) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: req.body.userEmail,
    subject: "👋 Hello from Node.js 🚀",
    text: `This is the confirmation code: ${req.confirmationPassword} 📧💻`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error:", error.message);
      sendResponse(
        res,
        500,
        `confirmation mail sending failure with ${+error.messages}`,
        "error",
        error,
      );
    } else {
      console.log("✅ Email sent:", info.response);
      sendResponse(res, 200, "confirmation mail sent", "mail info", info);
    }
  });
}

/*****************************************************************************/

async function verifyConfirmationPassword(req, res, next) {
  var status;
  var statusExplanation;
  const minSubmitionTime = new Date(Date.now() - 60 * 15 * 1000); //ten minuts limit
  try {
    const validPendingUser = await findAndDeletePendingUser(
      req.body.confirmationPassword,
      minSubmitionTime,
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

async function completeRegistration(req, res, next) {
  try {
    await createUser({
      name: req.pendingUser.name,
      email: req.pendingUser.userEmail,
      hashedPassword: req.pendingUser.userHashedPassword,
      salt: req.pendingUser.salt,
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
  let isCorrectPassword = null;
  try {
    var registeredUser = await findUserByEmail(userEmail);
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

  req.name = registeredUser.name;

  next();
}

/*****************************************************************************/

async function hashingThePassword(unHashedPassword, salt) {
  // Hash the password with the generated salt
  return await bcrypt.hash(unHashedPassword, salt);
}

/*****************************************************************************/

function sendResponse(res, resStatus, responseExplanation, dataKey, dataValue) {
  let responseBody = {
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
  savePendingUser,
  sendConfirmationEmail,
  verifyConfirmationPassword,
  completeRegistration,
  verifyLoginCredentials,
};
