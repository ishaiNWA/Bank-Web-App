const bankSharedSchema = require('bank-shared-schemas');
const dbOperations = require("../services/db-service");
const BadQueryError = require('../errors/BadQueryError');
const {publishMessage} = require("../services/rabbitmq-producer");
const sendMail = require("../services/mail-service");
const mailMessages = require ("../constants/mail-messages")

/*****************************************************************************/

async function validateStandingOrderFormSchema(req, res, next){

    const standingOrderForm = req.body.standingOrderForm;

    if(!standingOrderForm){
        sendResponse(res , 400 ,"should supply a proper Standing Order Form in the request body");
    }
    standingOrderForm.requestID = req.requestID;
    const { error } = bankSharedSchema.validateStandingOrderFormSchema(standingOrderForm);

    if(error){
        sendResponse(res, 400 , error.message, "the Standing Order Form you have supplied is malformed","error", error);
        return;
    }

    console.log(`standingOrderForm.senderEmail " ${standingOrderForm.senderEmail}`);
    console.log(`req.userEmail : ${req.userEmail}`);
    if(standingOrderForm.senderEmail !== req.userEmail){
            sendResponse(res, 400 , "A user can register a standing order only it's own account");
            return;
    }

    try{
    await dbOperations.findUserAccountIdByEmail(standingOrderForm.senderEmail);
    await dbOperations.findUserAccountIdByEmail(standingOrderForm.recipientEmail);

    }catch(error){
    if (error instanceof BadQueryError) {
        sendResponse(res, 400, "Unfound user account for one of the participants in the transaction", "error", error.message);
        return;
    }
    sendResponse(res, 500, "An unexpected error occured during database query", "error", error)
    return;
    }

    next();
}
/*****************************************************************************/

async function submitTaskToScheduleFinService(req, res, next){

    let msg;
    try{
        msg = Buffer.from(JSON.stringify(req.body.standingOrderForm))

    }catch(error){
        sendResponse(res, 400, "Error during serialization process", "error", error.message);
        return;       
    }

    try{
        await publishMessage(msg)
    }catch(error){
        sendResponse(res, 500, "Unexpected error during message publishing", "error", error.message);        
        return;
    }

    next();
}

/*****************************************************************************/

 function confirmTaskSchedulingByEmail(req, res, next){

    const mailOptions = {
        to: req.userEmail,
        subject: "scheduled task has been submitted",
        text: mailMessages.getScheduledTaskSubmissionMsg(req.body.standingOrderForm),
      };

    sendMail(
        mailOptions,   
        (info)=>sendResponse(res ,200 ,"Comfirmation mail for task scheduling has been sent to client", "info", info), //success callback
        (error)=> sendResponse(res, 500, `mail sending failure with ${error.messages}`, "error", error), // failure callback
    )
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

module.exports ={
    validateStandingOrderFormSchema,
    submitTaskToScheduleFinService,
    confirmTaskSchedulingByEmail,
}