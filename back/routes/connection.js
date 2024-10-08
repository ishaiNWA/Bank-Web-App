var express = require("express");
const jwtController = require("../controllers/jwt_controller");
var connectionController = require("../controllers/connection_controller");

var router = express.Router();

router.post(
  "/register",
  connectionController.validateRegistrationDetails,
  connectionController.savePendingUser,
  connectionController.sendConfirmationEmail,
);

router.post(
  "/register-confirmation",
  connectionController.verifyConfirmationPassword,
  connectionController.completeRegistration,
);

router.post(
  "/login",
  connectionController.verifyLoginCredentials,
  jwtController.generateJWT,
);

router.delete("/logout", jwtController.verifyJWT, jwtController.blacklistToken);

module.exports = router;
