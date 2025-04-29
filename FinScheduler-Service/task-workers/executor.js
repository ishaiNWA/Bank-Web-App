const logger = require("./logger");
const dbService = require("../services/mongodb-service");
TaskFormsQueue = require("../helpers/TaskFormsQueue-class");
let taskFormsQueue;
let queueEvents;

function initAndListenToQueue(){

    taskFormsQueue = new TaskFormsQueue();
    taskFormsQueue.on(taskFormsQueue.NEW_TASK_EVENT, ()=>{
        executeTask(taskFormsQueue.peekFront());
    })
    
}

function pushTaskFormsToExecutor(taskFormsArr){

    taskFormsArr.forEach(task => {
        taskFormsQueue.enqueue(task);
    });
}


//TODO:: research and handle racing condition situation
async function executeTask(task){

    
    const context = task.scheduledFinTaskID

    try{    
        const res =  sendTaskToBankApi(task ,context);

        if(res?.statusCode === 200){
            //check: is last payment? notify client and remove task from DB : set next payment
            
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
        logger.error(`unexpected error while trying to send task to bank api - crashing app`, 
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