var express = require("express");
const jwt = require("../middlewares/jwt");
const accessControl = require("../middlewares/access-control");
var IAmController = require("../controllers/i-am-controller");
const USER_ROLES = require("../constants/roles");
var router = express.Router();


router.post(
  "/register",
  IAmController.registerPendingUser,
  IAmController.sendRegConfirmationMail
);

router.post(
  "/invite-manager",
  jwt.protect,
  accessControl.authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  accessControl.setManagerRegistrationRole,
  IAmController.registerPendingUser,
  IAmController.sendRegConfirmationMail
);

router.post(
  "/client-register-confirmation",
  IAmController.setClientConfirmationMode,
  IAmController.verifyConfirmationCode,
  IAmController.registerUser
);

router.post(
  "/manager-register-confirmation",
  IAmController.setManagerConfirmationMode,
  IAmController.ensureManagerPassword ,
  IAmController.verifyConfirmationCode,
  IAmController.addPasswordToPendingManagerDoc,
  IAmController.registerUser
)

router.post("/login", IAmController.verifyLoginCredentials, jwt.generateJWT);

router.delete("/logout", jwt.protect, jwt.blacklistToken);

module.exports = router;
