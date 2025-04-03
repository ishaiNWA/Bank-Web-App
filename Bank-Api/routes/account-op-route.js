const express = require("express");
const jwt = require("../middlewares/jwt");
const accessControl = require("../middlewares/access-control");
const accountManagingContoller = require("../controllers/account-op-controller");

const router = express.Router();

router.get(
  "/balance",
  jwt.protect,
  accessControl.roleAccessControl,
  accountManagingContoller.getBalance
);

router.post("/transaction",
   jwt.protect,
   accountManagingContoller.enssurValidTransactionConditions,
   accountManagingContoller.performTransaction);

router.get(
  "/transactions",
  jwt.protect,
  accessControl.roleAccessControl,
  accountManagingContoller.validatePaginationParams,
  accountManagingContoller.getTransactions
);

module.exports = router;
