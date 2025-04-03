var express = require("express");
const jwt = require("../middlewares/jwt");
const accessControl = require("../middlewares/access-control");
var connectionController = require("../controllers/connection_controller");
const USER_ROLES = require("../constants/roles");
var router = express.Router();


router.post(
  "/register",
  connectionController.registerPendingUser,
  connectionController.sendRegConfirmationMail
);

router.post(
  "/invite-manager",
  jwt.protect,
  accessControl.authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  accessControl.setManagerRegistrationRole,
  connectionController.registerPendingUser,
  connectionController.sendRegConfirmationMail
);

router.post(
  "/client-register-confirmation",
  connectionController.setClientConfirmationMode,
  connectionController.verifyConfirmationCode,
  connectionController.registerUser
);

router.post(
  "/manager-register-confirmation",
  connectionController.setManagerConfirmationMode,
  connectionController.ensureManagerPassword ,
  connectionController.verifyConfirmationCode,
  connectionController.addPasswordToPendingManagerDoc,
  connectionController.registerUser
)

router.post("/login", connectionController.verifyLoginCredentials, jwt.generateJWT);

router.delete("/logout", jwt.protect, jwt.blacklistToken);

module.exports = router;
