import {
  sendRequest,
  TRANSACTIONS_URL,
  MAKE_TRANSACTION_URL,
  GET_BALANCE_URL,
  LOGOUT_URL,
} from "./ApiUtils";
import {
  isValidEmailAddress,
  isValidTransactionAmount,
} from "./inputValidationUtils";

const JWT_EXPIRED_MSG = "Your session has ended. Please log in again.";
const AUTH_ERROR =
  "The service couldn't recognize you. Please try to log in again.";
const INSUFFICIENT_FUNDS_MSG =
  "Not enough money in the account to make this transaction";
const INVALID_RECIPIENT_MSG =
  "We couldn't find the user you are trying to transact with in our system. Please check for a correct recipient email and try again.";
const SUCCESSFUL_TRANSACTION_MSG = "Transaction has been made successfully";
const GENERAL_ERROR_MSG = "An error has occurred. Please try to log in again.";
const SUCCESSFUL_LOGOUT_MSG = "You are now logged out. Goodbye!";

export const DEFAULT_TRANSACTIONS_LIMIT = 10;
export const DEFAULT_TRANSACTIONS_OFFSET = 0;

/*****************************************************************************/

export const getBalance = async (getBalanceDataObj) => {
  const { jwt, navigate } = getBalanceDataObj;

  const res = await sendRequest("GET", GET_BALANCE_URL, null, jwt, null);

  if (200 !== res.status) {
    errorResponseHandler(res, navigate);
  }

  return res;
};

/*****************************************************************************/

export const makeTransactionHandler = async (makeTransactionDataObj) => {
  const { jwt, navigate, recipientEmail, amount, notifyAccountUpdate } =
    makeTransactionDataObj;

  if (!isValidEmailAddress(recipientEmail)) {
    alert("invalid email address");
    return;
  }
  if (!isValidTransactionAmount(amount)) {
    alert("Please enter a positive value you wish to transact");
    return;
  }

  const requestBody = {
    recipientEmail,
    amount,
  };

  const res = await sendRequest(
    "POST",
    MAKE_TRANSACTION_URL,
    requestBody,
    jwt,
    null
  );

  if (200 !== res.status) {
    errorResponseHandler(res, navigate);
  } else {
    notifyAccountUpdate();
    alert(SUCCESSFUL_TRANSACTION_MSG);
  }

  return;
};

/*****************************************************************************/

export const logOutHandler = async (logOutDataObj) => {
  const { jwt, navigate } = logOutDataObj;

  const res = await sendRequest("DELETE", LOGOUT_URL, null, jwt, null);

  if (200 !== res.status) {
    errorResponseHandler(res, navigate);
  } else {
    alert(SUCCESSFUL_LOGOUT_MSG);
  }

  navigate("/auth");
};

/*****************************************************************************/

export const getTransactions = async (getTransactionDataObj) => {
  const { jwt, navigate, limit, offset } = getTransactionDataObj;

  const param = {
    limit: limit,
    offset: offset,
  };

  const res = await sendRequest("GET", TRANSACTIONS_URL, null, jwt, param);

  if (200 !== res.status) {
    errorResponseHandler(res, navigate);
  }

  return res;
};

/*****************************************************************************/

const errorResponseHandler = (res, navigate) => {
  switch (res.status) {
    case 400:
      alert(AUTH_ERROR);
      navigate("/auth");
      break;
    case 401:
      alert(JWT_EXPIRED_MSG);
      navigate("/auth");
      break;
    case 402:
      alert(INSUFFICIENT_FUNDS_MSG);
      break;
    case 404:
      alert(INVALID_RECIPIENT_MSG);
      break;
    default:
      alert(GENERAL_ERROR_MSG);
  }
};
