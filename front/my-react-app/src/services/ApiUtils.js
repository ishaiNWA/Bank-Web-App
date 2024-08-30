import axios from "axios";

// API Endpoints

export const REGISTER_URL = process.env.REACT_APP_REGISTER_URL;
export const REGISTER_CONFIRMATION_URL =
  process.env.REACT_APP_REGISTER_CONFIRMATION_URL;
export const LOGIN_URL = process.env.REACT_APP_LOGIN_URL;
export const TRANSACTIONS_URL = process.env.REACT_APP_TRANSACTIONS_URL;
export const MAKE_TRANSACTION_URL = process.env.REACT_APP_MAKE_TRANSACTION_URL;
export const GET_BALANCE_URL = process.env.REACT_APP_GET_BALANCE_URL;
export const LOGOUT_URL = process.env.REACT_APP_LOGOUT_URL;

/*****************************************************************************/

/**
 * Sends an HTTP request using axios
 * @param {string} method -  HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} url -  URL to send the request to
 * @param {object} [data=null] -  data to send in the request body
 * @param {string} [jwt=null] -  JWT token for authentication
 * @param {object} [params=null] -  URL parameters
 * @returns {Promise} -  axios response or error object
 */

export async function sendRequest(
  method,
  url,
  data = null,
  jwt = null,
  params = null
) {
  try {
    const res = await axios({
      method: method.toLowerCase(),
      url,
      data: method === "GET" ? null : data,
      headers: {
        Authorization: jwt,
      },
      params: params,
    });
    return res;
  } catch (error) {
    console.log("ERROR IS: ");
    console.log(error);
    return error.response;
  }
}
