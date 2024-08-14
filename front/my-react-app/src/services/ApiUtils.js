import axios from "axios";

export const REGISTER_URL = "http://127.0.1.1:3000/api/connection/register";
export const REGISTER_CONFIRMATION_URL =
  "http://127.0.1.1:3000/api/connection/register-confirmation";
export const LOGIN_URL = "http://127.0.0.1:3000/api/connection/login";
export const TRANSACTIONS_URL =
  "http://127.0.0.1:3000/api/account_managing/transactions";
export const MAKE_TRANSACTION_URL =
  "http://127.0.0.1:3000/api/account_managing/transaction";
export const GET_BALANCE_URL =
  "http://127.0.0.1:3000/api/account_managing/balance";
export const LOGOUT_URL = "http://127.0.0.1:3000/api/connection/logout";

export async function sendRequest(method, URL, data, jwt, params) {
  console.log("URL is");
  console.log(URL);

  var res;
  try {
    res = await axios({
      method: method.toLowerCase(),
      url: URL,
      data: method === "GET" ? null : data,
      headers: {
        Authorization: jwt ? jwt : null,
      },
      params: params ? params : null,
    });
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}
