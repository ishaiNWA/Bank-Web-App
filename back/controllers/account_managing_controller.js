const {
  mongoose,
  findUsersTransactions,
  findUserByEmail,
  addToRecipient,
  subtractFromSender,
  registerTransaction,
  findUserBalance,
} = require("../database/DB_operations");
const validator = require("email-validator");
async function getBalance(req, res, next) {
  let usersBalance;
  try {
    usersBalance = await findUserBalance(req.userEmail);
  } catch (error) {
    sendResponse(res, 500, "internal error", "error", error);
    return;
  }
  sendResponse(
    res,
    200,
    "successfully found user's balance",
    "balance",
    usersBalance,
  );
}

/*****************************************************************************/
function validatePaginationParams(req, res, next) {
  let { limit, offset } = req.query;
  limit = limit === undefined || limit === "" ? 10 : limit;
  offset = offset === undefined || offset === "" ? 0 : offset;

  try {
    if (limit === "All") {
      limit = null;
    } else {
      if (
        !Number.isInteger(Number(limit)) ||
        !Number.isInteger(Number(offset))
      ) {
        throw new Error("Query parameters must be integers");
      }
    }
    if (limit !== null && limit < 1) {
      throw new Error(
        "invalid query parameters: limit must be positive number",
      );
    }
    if (offset < 0) {
      throw new Error("invalid query parameters: offset must be non-negative");
    }
  } catch (error) {
    return sendResponse(res, 400, error.message, null, null);
  }
  req.locals = req.locals || {};
  req.locals.pagination = { offset, limit };
  next();
}

/*****************************************************************************/
async function getTransactions(req, res, next) {
  // const limit =
  //   req.query.limit === undefined || req.query.limit === ""
  //     ? 10
  //     : req.query.limit;
  // const offset =
  //   req.query.offset === undefined || req.query.offset === ""
  //     ? 0
  //     : req.query.offset;

  // try {
  //   validatePaginationParams(limit, offset);
  // } catch (error) {
  //   return sendResponse(res, 400, error.message, null, null);
  // }

  const { offset, limit } = req.locals.pagination;
  let transactions = null;

  try {
    transactions = await findUsersTransactions(req.userEmail, offset, limit);
  } catch (error) {
    sendResponse(res, 500, "internal error", null, null);
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

// function validatePaginationParams(limit, offset) {
//   if (limit === "All") {
//     limit = null;
//   } else {
//     if (!Number.isInteger(Number(limit)) || !Number.isInteger(Number(offset))) {
//       throw new Error("Query parameters must be integers");
//     }
//   }
//   if (limit < 1 || offset < 0) {
//     throw new Error(
//       "invalid query parameters: limit must be positive and offset must be non-negative",
//     );
//   }
// }

/*****************************************************************************/

async function performTransaction(req, res, next) {
  let session;
  let updatedSenderBalance;
  let { recipientEmail, amount } = req.body;
  const userEmail = req.userEmail;

  try {
    validateTransactionInputs(amount, recipientEmail);
  } catch (error) {
    sendResponse(res, 400, error.message, null, null);
    return;
  }
  try {
    if (!(await isSufficientFunds(userEmail, amount))) {
      sendResponse(res, 402, "insufficient funds", null, null);
      return;
    }

    const isValid = await isUserExist(recipientEmail);
    if (!isValid) {
      sendResponse(res, 404, "invalid recipient", null, null);
      return;
    }

    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await addToRecipient(recipientEmail, amount, session);

      updatedSenderBalance = await subtractFromSender(
        userEmail,
        amount,
        session,
      );
      await registerTransaction(userEmail, recipientEmail, amount, session);
    });
  } catch (error) {
    sendResponse(res, 500, "internal error", "error", error);
    return;
  } finally {
    if (session) {
      await session.endSession();
    }
  }

  sendResponse(
    res,
    200,
    "successful transaction",
    "current balance",
    updatedSenderBalance,
  );
  return;
}

/*****************************************************************************/

function validateTransactionInputs(amount, recipientEmail) {
  if (!Number.isInteger(Number(amount))) {
    throw new Error("amount must be integers");
    return;
  }

  if (amount <= 0) {
    throw new Error("the transaction amount must be positive value");
    return;
  }

  if (!recipientEmail || !validator.validate(recipientEmail)) {
    throw new Error("invalid email format");
    return;
  }
}
/*****************************************************************************/

async function isUserExist(recipientEmail) {
  return !!(await findUserByEmail(recipientEmail));
}

/*****************************************************************************/

async function isSufficientFunds(email, amount) {
  const sendersBalance = await findUserBalance(email);
  return sendersBalance >= amount;
}

/*****************************************************************************/

function sendResponse(res, resStatus, responseExplanation, dataKey, dataValue) {
  const responseBody = {
    explanation: responseExplanation,
  };
  if (dataKey) {
    responseBody[dataKey] = dataValue;
  }
  res.status(resStatus).json(responseBody);
}

/*****************************************************************************/

module.exports = {
  getBalance,
  validatePaginationParams,
  getTransactions,
  performTransaction,
};
