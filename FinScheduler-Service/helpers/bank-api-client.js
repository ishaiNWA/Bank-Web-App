const logger = require("./logger");
const adminPostTransactionSheredSchema = require('bank-shared-schemas');
const httpService = require("../services/http-service");

const TARGET_NAME = "bank-api"

function buildAdminPostTransactionReq(taskDoc ,context){

    const reqBody = {
        senderEmail : taskDoc.senderEmail ,
        recipientEmail  : taskDoc.recipientEmail ,
        amount : taskDoc.amount
    };
    const { error } = adminPostTransactionSheredSchema.validateAdminPostTransactionSchema(reqBody);
    if(error){
        logger.error(`buildAdminPostTransactionReq schema Validation failed`, {
            context,
            validationError: error.details || error.message,
            reqBodyPreview: reqBody, 
        });
        throw error;
    }

    return reqBody;
}



async function sendPostTransactionTaskToBankApi(taskDoc, context){

    const reqBody = buildAdminPostTransactionReq(taskDoc ,context);

    const options = {
        method : 'POST',
        url : process.env.BANK_API_URL+"/api/account-managing/transaction" ,
        body : reqBody,
        timeout: 2000,
        disable_keep_alive: false
    }
    
    return await httpService.sendRequest(options, TARGET_NAME, context);

}

module.exports = {
    sendPostTransactionTaskToBankApi};

 