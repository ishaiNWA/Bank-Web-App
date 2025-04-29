const axios = require("axios"); 
const logger = require("../helpers/logger");
const sleep = require("../helpers/utils");

// Configuration constants
const MAX_SEND_ATTEMPT = 3;
const INITIAL_WAITING_TIME_IN_MS = 3000;
const SERVER_INTERNAL_ERR_MSG = `server internal error`;
const NO_RESPONSE_ERR_MSG = `network error`;

/**
 * Sends an HTTP request using axios with retry mechanism and error handling
 * @param {Object} options - Axios request configuration
 * @param {string} TARGET_NAME - Name of the target service (for logging)
 * @param {Object} context - Request context information/identifier
 * @returns {Promise<Object>} - Response object or error details
 */
async function sendRequest(options, TARGET_NAME, context) {
  let waitingTimeInSec = INITIAL_WAITING_TIME_IN_MS / 1000;

  for (let attempt = 0; attempt < MAX_SEND_ATTEMPT; attempt++) {
    try {
      // Attempt to send the request
      const res = await axios(options);
      logger.info(`request id ${context} was successfully sent to: ${TARGET_NAME}`);
      return {
        context: context,
        method: options.method,
        url: options.url,
        statusCode: res.status,
        failed: false,
        data: res.data,
        headers: res.headers
      };
    } catch (error) {
      logger.info(`error while trying to send request id ${context} to ${TARGET_NAME}`);

      // ERROR SECTION 1: Handle server errors (5xx) and network errors with retry mechanism
      if (error.response?.status >= 500 || error.request) {
        const errorReasoningMsg = error.response?.status ? SERVER_INTERNAL_ERR_MSG : NO_RESPONSE_ERR_MSG;

        logger.error(
          `request id ${context} to ${TARGET_NAME} failed in ${attempt + 1}/${MAX_SEND_ATTEMPT} attempts due to ${errorReasoningMsg}`
        );

        // If we haven't reached max attempts, retry with exponential backoff
        if (attempt + 1 < MAX_SEND_ATTEMPT) {
          logger.info(`will retry again in ${waitingTimeInSec} seconds...`);
          await sleep(waitingTimeInSec);
          waitingTimeInSec *= 2;
          continue;
        } else {
          // Max attempts reached - log and return standardized error response
          logger.error(`All ${MAX_SEND_ATTEMPT} attempts failed for request ${context} to ${TARGET_NAME}`, {
            lastError: error.message || 'Unknown error',
            errorType: error.response ? 'SERVER_ERROR' : 'NETWORK_ERROR',
            statusCode: error.response?.status || 0
          });

          return {
            context: context,
            method: options.method,
            url: options.url,
            statusCode: error.response?.status || 0,
            failed: true,
            error: {
              type: error.response ? "SERVER_ERROR" : "NETWORK_ERROR",
              errorCode: error.request?.code || null,
              errorStatus: error.response?.status || 0,
              message: error.message
            }
          };
        }
      } 
      // ERROR SECTION 2: Handle client errors (4xx) - return immediately without retrying
      else if (error.response) {
        logger.error(`error status returned from request id ${context} to ${TARGET_NAME}`);
        return {
          context: context,
          method: options.method,
          url: options.url,
          statusCode: error.response.status,
          failed: true,
          error: {
            type: "CLIENT_ERROR",
            errorStatus: error.response.status,
            message: error.message,
            responseData: error.response.data
          }
        };
      } 

      // ERROR SECTION 3: Handle programming/configuration errors - crash the application
      else {
        // Neither error.response nor error.request exists
        // This indicates a configuration/code error in the application
        logger.error(`application error while sending http request to ${TARGET_NAME} for request id: ${context} -crashing app.`, {
          errorMessage: error.message,
          error: error
        });

        const criticalError = new Error(`application error while sending http request to ${TARGET_NAME}-crashing app.`);
        criticalError.originalError = error;
        criticalError.originalErrorMessage = error.message;
        criticalError.context = context;
        criticalError.requestConfig = options;

        throw criticalError;
      }
    }
  }
}

module.exports = {
  sendRequest
};