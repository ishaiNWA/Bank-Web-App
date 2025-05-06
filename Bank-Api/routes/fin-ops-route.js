const express = require("express");
const jwt = require("../middlewares/jwt");
const accessControl = require("../middlewares/access-control");
const finOpsController = require("../controllers/fin-ops-controller");

const router = express.Router();

router.get(
  "/balance",
  jwt.protect,
  accessControl.roleAccessControl,
  finOpsController.getBalance
);

router.post("/transaction",
   jwt.protect,
   finOpsController.enssurValidTransactionConditions,
   finOpsController.performTransaction);

router.get(
  "/transactions",
  jwt.protect,
  accessControl.roleAccessControl,
  finOpsController.validatePaginationParams,
  finOpsController.getTransactions
);

module.exports = router;
