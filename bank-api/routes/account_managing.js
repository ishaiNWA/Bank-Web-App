const express = require("express");
const jwt = require("../middlewares/jwt");
const accountManagingContoller = require("../controllers/account_managing_controller");

const router = express.Router();

router.get("/balance", jwt.protect, accountManagingContoller.getBalance);

router.post(
  "/transaction",
  jwt.protect,
  accountManagingContoller.performTransaction
);

router.get(
  "/transactions",
  jwt.protect,
  accountManagingContoller.validatePaginationParams,
  accountManagingContoller.getTransactions
);

module.exports = router;
