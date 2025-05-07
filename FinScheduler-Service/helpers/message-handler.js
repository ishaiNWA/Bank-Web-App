const logger = require("./logger");
const taskService = require("../services/task-service");
const bankSharedSchema = require('bank-shared-schemas');


async function msgHandler(msg){


   const finTaskObj = JSON.parse(msg.content.toString('utf8'));

   validateFormSchema(finTaskObj)

   let context = {
    requestID : finTaskObj.requestID
   }
   
   
   pushedTaskDocument = await taskService.pushScheduledFinTaskToDb(finTaskObj , context);

    let requestID = finTaskObj.requestID;
    return requestID;
}


function validateFormSchema(finTaskObj){

    const { error } = bankSharedSchema.validateStandingOrderFormSchema(finTaskObj);
    if(error){
      throw new Error( "the Standing Order Form you have supplied is malformed");
    }

    logger.info(`Success format validation for request id: ${finTaskObj.requestID}`)
}

module.exports = msgHandler;