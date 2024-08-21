const {
  findUsersTransactions,
  findUserByEmail,
  addToRecipient,
  subtractFromSender,
  registerTrasaction,
  findUserBalance,
} = require("../database/DB_operations");

async function getBalance(req, res, next) {
  const usersBalance = await findUserBalance(req.userEmail);

  if (!usersBalance) {
    sendResponse(res, 400, "user's balance not found", null, null);
  } else {
    sendResponse(
      res,
      200,
      "successfully found user's balance",
      "balance",
      usersBalance,
    );
  }
}

/*****************************************************************************/

async function getTransactions(req, res, next) {
  // a valdiation for correct formating and negative numbers will occur in FRONT END!

  var limit = null == req.query.limit ? 10 : req.query.limit;
  var offset = null == req.query.offset ? 0 : req.query.offset;
  var transactions;

  try {
    transactions = await findUsersTransactions(req.userEmail, offset, limit);
  } catch (error) {
    sendResponse(res, 500, "inernal error", null, null);
  }

  sendResponse(
    res,
    200,
    "Transaction withdrawal successful",
    "transactions",
    transactions,
  );
}

/*****************************************************************************/

async function performTransaction(req, res, next) {
  const isSufficient = await isSufficientFunds(req.userEmail, req.body.amount);
  if (!isSufficient) {
    sendResponse(res, 402, "insufficient funds", null, null);
    return;
  }

  const isValid = await isValidRecipient(req.body.recipientEmail);
  if (!isValid) {
    sendResponse(res, 404, "invalid recipient", null, null);
    return;
  }

  var updatedSenderBalance = null;
  try {
    await addToRecipient(req.body.recipientEmail, req.body.amount);

    updatedSenderBalance = await subtractFromSender(
      req.userEmail,
      req.body.amount,
    );
    await registerTrasaction(
      req.userEmail,
      req.body.recipientEmail,
      req.body.amount,
    );
  } catch (error) {
    sendResponse(res, 500, "inernal error", "error", error);
    return;
  }

  sendResponse(
    res,
    200,
    "successful transaction",
    "current balance",
    updatedSenderBalance,
  );
}

/*****************************************************************************/

async function isValidRecipient(recipientEmail) {
  return !!(await findUserByEmail(recipientEmail));
}

/*****************************************************************************/

async function isSufficientFunds(email, amount) {
  const sendersBalance = await findUserBalance(email);
  return sendersBalance >= amount;
}

/*****************************************************************************/

function sendResponse(res, resStatus, responseExplanation, dataKey, dataValue) {
  let responseBody = {
    explanation: responseExplanation,
  };
  if (dataKey) {
    responseBody[dataKey] = dataValue;
  }
  res.status(resStatus).json(responseBody);
}

/*****************************************************************************/

module.exports = { getBalance, getTransactions, performTransaction };
