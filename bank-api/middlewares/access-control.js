const USER_ROLES = require("../constants/roles");

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

function applyGetFunctionAccessControl(req, res, next) {
  if (req.role === USER_ROLES.ADMIN || req.role === USER_ROLES.MANAGER) {
    req.targetUserEmail = req.query.targetUser;
  } else {
    req.targetUserEmail = req.userEmail;
  }
  next();
}

/*****************************************************************************/

function setManagerRegistrationRole(req, res, next) {
  req.registrationRole = USER_ROLES.MANAGER;
  next();
}
/*****************************************************************************/
module.exports = {
  authorize,
  applyGetFunctionAccessControl,
  setManagerRegistrationRole,
};
