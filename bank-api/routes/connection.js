var express = require("express");
const jwt = require("../middlewares/jwt");
var connectionController = require("../controllers/connection_controller");
const USER_ROLES = require("../constants/roles");
var router = express.Router();

router.post(
  "/invite-manager",
  jwt.protect,
  jwt.authorize(USER_ROLES.ADMIN),
  connectionController.inviteManagerMember
);

router.post(
  "/register-manager",
  connectionController.validateRegistrationDetails,
  connectionController.validateManagerInvitation,
  connectionController.registerManager
);

router.post(
  "/register",
  connectionController.validateRegistrationDetails,
  connectionController.registerPendingUser
);

router.post(
  "/register-confirmation",
  connectionController.verifyConfirmationPassword,
  connectionController.registerUser
);

router.post(
  "/login",
  connectionController.verifyLoginCredentials,
  jwt.generateJWT
);

router.delete("/logout", jwt.protect, jwt.blacklistToken);

module.exports = router;
