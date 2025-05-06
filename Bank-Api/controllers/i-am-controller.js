const {
  mongoose,
  findUserByEmail,
  deletePendingUserByEmail,
  createPendingUser,
  findAndDeletePendingUser,
  createUser,
 // createManagerInvitation,
  findManagerInvitationByEmail,
  executeWithTransaction,
  deleteManagerInvitationByEmail,
  createAccount,
  addAccountToUser,
} = require("../services/db-service");
const sendMail = require("../services/mail-service");
const bcrypt = require("bcrypt");
const validator = require("email-validator");
const validation = require("../helpers/validation-helper");
const USER_ROLES = require("../constants/roles");
const REGISTRATION_STATUS = require("../constants/registration-status");
const mailmessages = require("../constants/mail-messages");

/*****************************************************************************/

async function credentialsValidationManager(credentialsObj, registrationStatus) {
  try {
    if (registrationStatus === REGISTRATION_STATUS.MANAGER_INVITATION) {
      const { userName, userEmail } = credentialsObj;
      validation.isValidEmailFormat(userEmail);
      validation.isValidName(userName);
      await validation.isUniqueUserName(userEmail);

    } else if (registrationStatus === REGISTRATION_STATUS.MANAGER_CONFIRMATION) {
      const password = credentialsObj.password;
      validation.isValidPasswordFormat(password);

    } else if (registrationStatus === REGISTRATION_STATUS.CLIENT_REGISTRATION) {
      const { userName, userEmail, password } = credentialsObj;
      validation.isValidEmailFormat(userEmail);
      validation.isValidName(userName);
      await validation.isUniqueUserName(userEmail);
      validation.isValidPasswordFormat(password);
    }
  } catch (error) {
    throw error; //rethrow error...
    //  sendResponse(res, 400, error.message, null, null);
  }
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

async function isUniqueUserName(userEmail) {
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

  req.registrationRole = req.registrationRole === USER_ROLES.MANAGER? USER_ROLES.MANAGER : USER_ROLES.CLIENT;
  
  try {
    if (req.registrationRole === USER_ROLES.CLIENT) {
      // client registration validation
      credentialsValidationManager(
        { userName: req.body.userName,
          userEmail: req.body.userEmail,
          password: req.body.password }, 
        REGISTRATION_STATUS.CLIENT_REGISTRATION
      );
    }
    else if(req.registrationRole === USER_ROLES.MANAGER){
      credentialsValidationManager(
        {
          userName: req.body.userName,
          userEmail: req.body.userEmail,
        },
        REGISTRATION_STATUS.MANAGER_INVITATION
      )
    }
  } catch (error) {
    sendResponse(res, 400, error.message, null, null);
    return;
  }

  let session;
  let confirmationCode;
  try {

    let userHashedPassword  
    if (req.registrationRole === USER_ROLES.CLIENT){
      //extracting password for a CLIENT-role user
      const salt = await bcrypt.genSalt(10);
      userHashedPassword = await hashingThePassword(req.body.password, salt);
    }
    //registration code to be sent to  ANY user
    confirmationCode = Math.random().toString(36).slice(-8);

    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await deletePendingUserByEmail(req.body.userEmail, session); //confirm no duplication created

      await createPendingUser(
        {
          name: req.body.userName,
          confirmationCode: confirmationCode,
          userEmail: req.body.userEmail,
          userHashedPassword: userHashedPassword,
          role : req.registrationRole
        },
        session
      );
    });

    req.confirmationCode = confirmationCode;
    next();

  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "internal error", "error", error);
    return;
  } finally {
    if (session) {
      await session.endSession();
    }
  }

}

/*****************************************************************************/

async function sendRegConfirmationMail(req, res, next){

  const{confirmationCode, userRole} = req;

  const mailOptions = {
    to: req.body.userEmail,
    subject: "user register confirmation code",
    text: mailmessages.getRegisterConfirmationMsg(confirmationCode ,userRole),
  };

  sendMail(
    mailOptions,
    (info) => {
      console.log("✅ Email sent:", info.response);
      sendResponse(res, 200, "mail sent", "mail info", info);
    },
    (error) => {
      console.error("❌ Error:", error.message);
      sendResponse(res, 500, `mail sending failure with ${error.messages}`, "error", error);
    }
  );
}

/*****************************************************************************/

async function verifyConfirmationCode(req, res, next) {

  let status;
  let statusExplanation;
  const minSubmitionTime = new Date(Date.now() - 60 * 15 * 1000); //ten minuts limit
  try {
    const pendingUserDoc = await findAndDeletePendingUser(
      req.body.confirmationCode,
      minSubmitionTime
    );

    if (!pendingUserDoc || pendingUserDoc.role !== req.registerConfirmationMode ) {
      status = 400;
      statusExplanation =
      "No matching confirmation password or pending state has expired." +
      " Check if correct password was inserted, or you might be using the wrong registration URL/route for your account type." +
      " Please ensure you're using the correct registration link for your role, or register again and confirm password within" +
      " the 10 minutes limit";
      sendResponse(res, status, statusExplanation, null, null);
      return;
    }
    
      req.pendingUser = pendingUserDoc;
      next();
    
  } catch (error) {
    sendResponse(res, 500, "internal error", "error", error);
  }
}

/*****************************************************************************/

async function ensureManagerPassword(req, res, next){
  try{
     await credentialsValidationManager({password : req.body.password}, REGISTRATION_STATUS.MANAGER_CONFIRMATION)
  } catch (error) {
    return sendResponse(res, 400, error.message, null, null);  
  }
    
    next();
  }
/*****************************************************************************/

async function registerUser(req, res, next) {

  const{name , userEmail, userHashedPassword, role} = req.pendingUser
  try {
    executeWithTransaction(async (session) => {
      const userDoc = await createUser(
        {
          name: name,
          email: userEmail,
          hashedPassword: userHashedPassword,
          role: role
        },
        session
      );
      if(role === USER_ROLES.CLIENT){
        const accountDoc = await createAccount(userDoc._id, session);
        await addAccountToUser(userDoc._id, accountDoc._id, session);

      }

      sendResponse(res, 200, "user has been successfully registered", null, null);
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "registration error", "error", error);
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

// async function inviteManagerMember(req, res, next) {
//   generatedToken = Math.random().toString(36).slice(-8);
//   const salt = await bcrypt.genSalt(10);
//   const hashedToken = await hashingThePassword(generatedToken, salt);

//   const invitedMemberObj = {
//     name: req.body.userName,
//     email: req.body.userEmail,
//     role: USER_ROLES.MANAGER,
//     hashedToken: hashedToken,
//   };

//   try {
//     executeWithTransaction(async (session) => {
//       //ensure no duplication of ManagerInvitation document
//       await deleteManagerInvitationByEmail(req.body.userEmail, session);
//       await createManagerInvitation(invitedMemberObj, session);
//     });
//   } catch (error) {
//     sendResponse(res, 500, "internal error", "error", error);
//   }

//   const mailOptions = {
//     to: req.body.userEmail,
//     subject: "manager invitation code",
//     text: MA
//   };

//   sendMail(
//     mailOptions,
//     (info) => {
//       console.log("✅ Email sent:", info.response);
//       sendResponse(res, 200, "mail sent", "mail info", info);
//     },
//     (error) => {
//       console.error("❌ Error:", error.message);
//       sendResponse(res, 500, `mail sending failure with ${error.messages}`, "error", error);
//     }
//   );
// }

/*****************************************************************************/

// async function validateManagerInvitation(req, res, next) {
//   let managerInvDoc;
//   try {
//     managerInvDoc = await findManagerInvitationByEmail(req.body.userEmail);
//   } catch (error) {
//     sendResponse(res, 500, "internal error", "error", error);
//     return;
//   }

//   if (!managerInvDoc || !(await bcrypt.compare(req.body.token, managerInvDoc.hashedToken))) {
//     sendResponse(
//       res,
//       403,
//       "Invalid invitation or token. Please retry again with correct credentials or request a new invitation link."
//     );
//     return;
//   }
//   req.managerInvDoc = managerInvDoc;
//   next();
// }

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
function setManagerConfirmationMode(req, res, next){
  req.registerConfirmationMode = USER_ROLES.MANAGER
  next();
}

/*****************************************************************************/
function setClientConfirmationMode(req, res, next){
  req.registerConfirmationMode = USER_ROLES.CLIENT
  next();
}

/*****************************************************************************/

async function addPasswordToPendingManagerDoc(req, res, next){
  const salt = await bcrypt.genSalt(10);
  req.pendingUser.userHashedPassword = await hashingThePassword(req.body.password, salt);
  next();
  
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
  registerPendingUser,
  verifyConfirmationCode,
  registerUser,
  verifyLoginCredentials,
 // inviteManagerMember,
 // validateManagerInvitation,
  registerManager,
  ensureManagerPassword,
  sendRegConfirmationMail,
  setManagerConfirmationMode,
  setClientConfirmationMode,
  addPasswordToPendingManagerDoc,
};
