var express = require("express");
const jwt = require("../middlewares/jwt");
var connectionController = require("../controllers/connection_controller");

var router = express.Router();

router.post(
  "/register",
  connectionController.validateRegistrationDetails,
  connectionController.savePendingUser,
  connectionController.sendConfirmationEmail
);

router.post(
  "/register-confirmation",
  connectionController.verifyConfirmationPassword,
  connectionController.saveUser
);

router.post(
  "/login",
  connectionController.verifyLoginCredentials,
  jwt.generateJWT
);

router.delete("/logout", jwt.protect, jwt.blacklistToken);

module.exports = router;
