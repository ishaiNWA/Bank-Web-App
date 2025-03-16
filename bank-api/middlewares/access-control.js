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

function applyFunctionAccessControl(req, res, next) {
  if (req.role === USER_ROLES.ADMIN || req.role === USER_ROLES.MANAGER) {
    req.targetUserEmail = req.query.targetUser;
  } else {
    req.targetUserEmail = req.userEmail;
  }
  next();
}

module.exports = {
  authorize,
  applyFunctionAccessControl,
};
