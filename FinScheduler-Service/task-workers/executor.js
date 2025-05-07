const logger = require("./logger");
const dbService = require("../services/mongodb-service");
TaskFormsQueue = require("../helpers/TaskFormsQueue-class");
const taskService = require("../services/task-service");
const bankApiClient = require("../helpers/bank-api-client");
const PAYMENT_DONE_MSG = (taskDoc)=>`${taskDoc.totalPayments}/${taskDoc.paymentsDone} from ${taskDoc.senderEmail} to ${taskDoc.recipientEmail} is done`
let taskFormsQueue;
let queueEvents;


function initAndListenToQueue(){

    taskFormsQueue = new TaskFormsQueue();
    taskFormsQueue.on(taskFormsQueue.NEW_TASK_EVENT, ()=>{
        executeTask(taskFormsQueue.peekFront());
    })
    
}

function pushTaskFormsToExecutor(taskFormsArr){

    taskFormsArr.forEach(taskDoc => {
        taskFormsQueue.enqueue(taskDoc);
    });
}


//TODO:: research and handle racing condition situation
async function executeTask(taskDoc){

    
    const context = taskDoc.scheduledFinTaskID

    try{    
        const res =  bankApiClient.sendPostTransactionTaskToBankApi(taskDoc ,context);

        if(res?.statusCode === 200){
            taskService.incrementTaskDoneCounter(taskDoc)
            if(taskService.isLastPayment(taskDoc)){
                logger.info({msg: PAYMENT_DONE_MSG(taskDoc), context})
               await taskService.removeTaskFromDb(taskDoc, context)
            }else{
                taskService.scheduleNextPayment(taskDoc)
               await taskService.updateTaskDocToDb(taskDoc , context);
                
            }
            const msgToClient =  PAYMENT_DONE_MSG(taskDoc);
            //mail msg
            
        }else if(res?.statusCode === 409 ){
                //transaction was already made
                //check: is last payment? notify client and remove task from DB : set next payment
        }else if(res?.statusCode === 401){
            //unauthorized request
            //login and try again
        }else if(res?.statusCode === 404){
            //unfound account or user
            //log 
            //remove from db
        }else if(["SERVER_ERROR" ,"NETWORK_ERROR"].includes(res.error.type)){

            //postpone task in db
            //remove from queue
            //log 

        } 
    }
    catch(error){
        logger.error(`unexpected error during task execution - crashing app`, 
            context,
            error.message,
            error,
        )
    }
    
}


module.exports = {
    initAndListenToQueue,
    pushTaskFormsToExecutor,
}