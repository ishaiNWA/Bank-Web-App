import { Sync } from "@mui/icons-material";
import {
  sendRequest,
  TRANSACTIONS_URL,
  MAKE_TRANSACTION_URL,
  GET_BALANCE_URL,
  LOGOUT_URL,
} from "./ApiUtils";
import {
  isValidEmailAddress,
  IsValidEmailAddress,
  isValidTransactionAmount,
} from "./inputValidationUtils";

const JWT_EXPIRED_MSG = "Your session has ended. Please log in again.";
const AUTH_ERROR =
  "The service couldn't recognize you. Please try to log in again.";
const INSUFFICIENT_FUNDS_MSG =
  "no enough money in the account to make this transaction";
const INVALID_RECIPIENT_MSG =
  "we couldnt find the user you are trying to transact to in our system" +
  " please check for  a correct recipient email and try again";
const SUCCESSFUL_TRANSACTION_MSG = "transaction has been made successfuly";
const GENERAL_ERROR_MSG = "error has occured. please try to login again.";
const SUCCESSFUL_LOGOUT_MSG = "you are now logged out. Goodby!";

export const DEAFULT_TRANSACTIONS_LIMIT = 10;
export const DEAFULT_TRANSACTIONS_OFFSET = 0;

// export function loadAccountHandler(jwt){

//     getTransactions(jwt ,DEAFULT_LIMIT ,setTransactionsArray );
//     //getBalance()

// }

export async function getTransactionsHandler(getTransactionDataObj) {
  const { jwt, navigate, limit, offset } = getTransactionDataObj;

  const param = {
    limit: limit,
    offset: offset,
  };

  const res = await sendRequest("GET", TRANSACTIONS_URL, null, jwt, param);

  if (200 !== res.status) {
    switch (res.status) {
      case 400:
        alert(AUTH_ERROR);
        break;
      case 401:
        alert(JWT_EXPIRED_MSG);
        break;
    }
    navigate("/auth");
  }

  //  const transactionsArray = res.data.transactions;
  return res;
}

export async function getBalanceHandler(getBalanceDataObj) {
  const { jwt, navigate } = getBalanceDataObj;

  const res = await sendRequest("GET", GET_BALANCE_URL, null, jwt, null);

  if (200 !== res.status) {
    switch (res.status) {
      case 400:
        alert(AUTH_ERROR);
        break;
      case 401:
        alert(JWT_EXPIRED_MSG);
        break;
    }
    navigate("/auth");
  }

  return res;
}

export async function makeTransactionHandler(makeTransactionDataObj) {
  const { jwt, navigate, recipientEmail, amount, notifyAccountUpdate } =
    makeTransactionDataObj;

  if (!isValidEmailAddress(recipientEmail)) {
    alert("Please enter a valid email for the recipient");
    return;
  }
  if (!isValidTransactionAmount(amount)) {
    alert("Please enter a positive value you wish to transact");
    return;
  }

  const requestBody = {
    recipientEmail: recipientEmail,
    amount: amount,
  };

  const res = await sendRequest(
    "POST",
    MAKE_TRANSACTION_URL,
    requestBody,
    jwt,
    null
  );

  console.log("res is");
  console.log(res);
  if (200 !== res.status) {
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
    }
  } else {
    console.log(notifyAccountUpdate);
    notifyAccountUpdate();
    alert(SUCCESSFUL_TRANSACTION_MSG);
  }

  return;
}

export async function logOutHandler(logOutDataObj) {
  const { jwt, navigate } = logOutDataObj;

  const res = await sendRequest("DELETE", LOGOUT_URL, null, jwt, null);

  switch (res.status) {
    case 200:
      alert(SUCCESSFUL_LOGOUT_MSG);
      break;
    case 400:
      alert(AUTH_ERROR);
      break;
    case 401:
      alert(JWT_EXPIRED_MSG);
      break;
    default:
      alert(GENERAL_ERROR_MSG);
  }

  navigate("/auth");
}

export const fetchTransactions = async (
  getOperationsDataObj,
  setTransactionsArray
) => {
  const res = await getTransactionsHandler(getOperationsDataObj);

  if (res.status === 200) {
    setTransactionsArray(res.data.transactions);
  }
};

export const fetchBalance = async (getOperationsDataObj, setCurrentBalance) => {
  const res = await getBalanceHandler(getOperationsDataObj);
  setCurrentBalance(res.data.balance);
};
