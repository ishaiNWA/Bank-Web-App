var express = require("express");
const jwt = require("../middlewares/jwt");
var connectionController = require("../controllers/connection_controller");

var router = express.Router();

router.post("/invite-manager", connectionController.inviteManagerMember);

router.post("/register-manager", connectionController.registerManager);

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
