const Balance = require("../model/Balance");
const User = require("../model/User");
const Transaction = require("../model/Transactions");

async function getBalance(req, res, next) {
  const usersBalance = await Balance.findOne({ email: req.userEmail });
  if (!usersBalance) {
    sendResponse(res, 400, "user's balance not found", null, null);
  } else {
    sendResponse(
      res,
      200,
      "successfully found user's balance",
      "balance",
      usersBalance.balance,
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
    transactions = await Transaction.find({
      $or: [{ senderEmail: req.userEmail }, { recipientEmail: req.userEmail }],
    })
      .sort({ date: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
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
  const isSufficient = await isSufficientFunds(req);
  if (!isSufficient) {
    sendResponse(res, 402, "insufficient funds", null, null);
    return;
  }

  const isValid = await isValidRecipient(req);
  if (!isValid) {
    sendResponse(res, 404, "invalid recipient", null, null);
    return;
  }

  var updatedSenderBalance = null;
  try {
    await addToRecipient(req);
    updatedSenderBalance = await subtractFromSender(req);
    await registerTrasaction(req);
  } catch (error) {
    sendResponse(res, 500, "inernal error", null, null);
  }

  sendResponse(
    res,
    200,
    "successful transaction",
    "current balance",
    updatedSenderBalance.balance,
  );
}

/*****************************************************************************/

async function subtractFromSender(req) {
  const updatedBalance = await Balance.findOneAndUpdate(
    { email: req.userEmail },
    { $inc: { balance: -req.body.amount } },
    { new: true },
  );

  return updatedBalance;
}

/*****************************************************************************/

async function addToRecipient(req) {
  await Balance.findOneAndUpdate(
    { email: req.body.recipientEmail },
    { $inc: { balance: req.body.amount } },
  );
}

/*****************************************************************************/

async function registerTrasaction(req) {
  await Transaction.create({
    senderEmail: req.userEmail, //the 'userEmail' was added by "verify JWT" function, so it's not in the "body"
    recipientEmail: req.body.recipientEmail,
    amount: req.body.amount,
  });
}

/*****************************************************************************/

async function isValidRecipient(req) {
  const user = await User.findOne({ email: req.body.recipientEmail });
  if (!user) {
    return false;
  } else {
    return true;
  }
}

/*****************************************************************************/

async function isSufficientFunds(req) {
  const sendersBalanceDocument = await Balance.findOne({
    email: req.userEmail,
  });
  const currentSendersBalance = sendersBalanceDocument.balance;
  if (currentSendersBalance < req.body.amount) {
    return false;
  } else {
    return true;
  }
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
