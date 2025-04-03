const USER_ROLES = require("../constants/roles");
const validation = require("../helpers/validation-helper")

function authorize(permitedRoles) {
  return (req, res, next) => {
    const role = req.role;

    if (!permitedRoles.includes(role)) {
      sendResponse(
        res,
        403,
        `Only ${permitedRoles.map((role) => String(role)).join(", ")} are permitted to this operation`
      );
      return;
    }
    next();
  };
}

/*****************************************************************************/

function roleAccessControl(req, res, next) {
  if (req.role === USER_ROLES.ADMIN || req.role === USER_ROLES.MANAGER) {
    try{
      validation.isValidEmailFormat(req.query.targetUser)
    }catch(error){
      sendResponse(res, 400, "No target email or invalid email format.");
      return;
    }
   
    req.targetUserEmail = req.query.targetUser;
    
    console.log("MANAGER ACCESS");
  } else {
    req.targetUserEmail = req.userEmail;
    console.log("CLIENT ACCESS");

  }
  next();
}

/*****************************************************************************/

function setManagerRegistrationRole(req, res, next) {
  req.registrationRole = USER_ROLES.MANAGER;
  next();
}
/*****************************************************************************/

function sendResponse(res, resStatus, responseExplanation, dataKey = null, dataValue = null) {
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
  authorize,
  roleAccessControl,
  setManagerRegistrationRole,
};
