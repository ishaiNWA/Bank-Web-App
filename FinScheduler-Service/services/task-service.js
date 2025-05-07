
const dbService = require("./mongodb-service");
const ScheduledBankTask = require("../models/ScheduledFinTask");
const logger = require("../helpers/logger");

/**
 * @desc Increments the `paymentsDone` counter in the task document locally.
 * for saving in db use update document function
 * @param {Object} taskDoc - A Mongoose document representing the task.
 */
function incrementTaskDoneCounter(taskDoc){
    taskDoc.paymentsDone += 1; 
}

function isLastPayment(taskDoc){
   return taskDoc.totalPayments === taskDoc.paymentsDone;
}

function scheduleNextPayment(taskDoc){
    const timeToNextPaymentInMonts = taskDoc.paymentFrequency;
    const paymentDayInMonth = taskDoc.nextPayment.getDate()
    taskDoc.nextPayment.setMonth(taskDoc.nextPayment.getMonth() + timeToNextPaymentInMonts)

    // Check for month rollover (happens when target month has fewer days)
    if (taskDoc.nextPayment.getDate() !== paymentDayInMonth){
      // Set to the last day of the intended month
      taskDoc.nextPayment.setDate(0);
    }
   }

async function pushScheduledFinTaskToDb(finTaskObj , context){

    const newDoc = await dbService.createNewDocument(ScheduledBankTask ,finTaskObj);
    if(newDoc){
        logger.info(`a new task document was pushed to db`,{
            context
        })
    }
    return newDoc;
}

async function getReadyToExecuteTasksFromDb(){
    
    const latestExecutionTime = new Date();
    latestExecutionTime.setHours(23,59,59,999);

    const filteringObj = {
        nextPayment : { $lt : latestExecutionTime}
    }
   const readyTasksDocsArray =  await dbService.findDocuments(ScheduledBankTask , filteringObj);
   logger.info(`found ${readyTasksDocsArray.length} tasks which are ready to execute`)
   return readyTasksDocsArray
}
   

async function removeTaskFromDb(taskDoc , context){
   const isDeletedDoc = await dbService.deleteSingleDocument(ScheduledBankTask, {_id : taskDoc._id})
   if(isDeletedDoc){
     logger.info(`a task document was deleted`,{
        context
     })
   }else{
        logger.info(`Failed to delete a task document`,{
        context
     })
   }
   return res;
}   

async function updateTaskDocToDb(newTaskDoc , context){
  const res =  await dbService.updateDocument(ScheduledBankTask, newTaskDoc, newTaskDoc._id);

  if(res.matchedCount > 0){
    logger.info(`successfully found updated a task document in to data base`,{context})
  }else{
    logger.info(`failed to find and update a task document in to data base`,{context})
  }

}

module.exports = {
    incrementTaskDoneCounter,
    isLastPayment,
    scheduleNextPayment,
    pushScheduledFinTaskToDb,
    getReadyToExecuteTasksFromDb,
    removeTaskFromDb,
    updateTaskDocToDb
}