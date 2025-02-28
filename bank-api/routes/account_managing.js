const express = require("express");
const jwtController = require("../controllers/jwt_controller");
const accountManagingContoller = require("../controllers/account_managing_controller");

const router = express.Router();

router.get(
  "/balance",
  jwtController.verifyJWT,
  accountManagingContoller.getBalance,
);

router.post(
  "/transaction",
  jwtController.verifyJWT,
  accountManagingContoller.performTransaction,
);

router.get(
  "/transactions",
  jwtController.verifyJWT,
  accountManagingContoller.validatePaginationParams,
  accountManagingContoller.getTransactions,
);

module.exports = router;
