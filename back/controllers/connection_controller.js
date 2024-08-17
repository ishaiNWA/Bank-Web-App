const User = require("../model/User");
const Balance = require("../model/Balance");
const PendingUser = require("../model/PendingUsers");

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

  // try {
  //   const user = await isUniqueEmail(userEmail);
  // } catch (error) {
  //   // error handling
  // }

  const user = await User.findOne({ email: userEmail });

  if (user) {
    sendResponse(
      res,
      400,
      "email address already existed in system",
      null,
      null,
    );
    return;
  }
  next();
}

/*****************************************************************************/

function isValidName(name) {
  let nameRegex = /^[a-zA-Z]{1,20}$/;
  return nameRegex.test(name);
}

/*****************************************************************************/

async function savePendingUser(req, res, next) {
  const generatedPassword = Math.random().toString(36).slice(-8);
  const salt = await bcrypt.genSalt(10);
  hashedPassword = await hashingThePassword(req.body.password, salt);

  try {
    await PendingUser.deleteOne({
      //confirm no duplication created
      userEmail: req.body.userEmail,
    });

    await PendingUser.create({
      name: req.body.name,
      confirmationPassword: generatedPassword,
      userEmail: req.body.userEmail,
      userHashedPassword: hashedPassword,
      salt: salt,
    });
  } catch (error) {
    sendResponse(res, 500, "internal error", "details", error);
    console.log(error);
    return;
  }

  req.confirmationPassword = generatedPassword;
  next();
}

/*****************************************************************************/

async function sendConfirmationEmail(req, res, next) {
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
    const validPendingUser = await PendingUser.findOneAndDelete({
      confirmationPassword: req.body.confirmationPassword,
      submissionTime: { $gte: minSubmitionTime },
    });

    clearPendingUsers(minSubmitionTime); // could be depricated after updating PendingUser to be expired

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

async function clearPendingUsers(minSubmitionTime) {
  PendingUser.deleteMany({ submissionTime: { $lte: minSubmitionTime } });
}

/*****************************************************************************/

async function completeRegistration(req, res, next) {
  try {
    await User.create({
      name: req.pendingUser.name,
      email: req.pendingUser.userEmail,
      hashedPassword: req.pendingUser.userHashedPassword,
      salt: req.pendingUser.salt,
    });
    await Balance.create({
      email: req.pendingUser.userEmail,
    });
    sendResponse(res, 200, "user has been successfully registered", null, null);
  } catch (error) {
    console.log(error);
    sendResponse(res, 400, "registration error", "error", error);
  }
}

/*****************************************************************************/

async function verifyLoginCradentials(req, res, next) {
  const { userEmail, password } = req.body;

  var registeredUser = await User.findOne({ email: userEmail });
  if (!registeredUser) {
    sendResponse(res, 400, "wrong email", null, null);
    return;
  }

  let isCorrectPassword = await bcrypt.compare(
    password,
    registeredUser.hashedPassword,
  );
  if (!isCorrectPassword) {
    sendResponse(res, 400, "wrong password", null, null);
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
  verifyLoginCradentials,
};
