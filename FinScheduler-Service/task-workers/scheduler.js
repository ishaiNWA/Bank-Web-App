const logger = require("./logger");
const dbService = require("../services/mongodb-service");
const schedule = require('node-schedule');
const executor = require("./executor");
const INTERVAL_IN_MINUTES = 15;

function scheduleTasksToExecution() {
  const job = schedule.scheduleJob(`*/${INTERVAL_IN_MINUTES} * * * *`, async function() {

    let taskFormsArray;
    try {
      taskFormsArray = await dbService.getReadyToExecuteTasks();      
    } catch(error) {
      logger.error(`unexpected error during scheduler operation, will try again in ${INTERVAL_IN_MINUTES} minutes, ${error.message}`);
    }

    if(taskFormsArray.length > 0){
      executor.pushTaskFormsToExecutor(taskFormsArray);
    }

  });
  
  logger.info(`Task scheduler started, running every ${INTERVAL_IN_MINUTES} minutes`);
  return job;
}

module.exports = {
  scheduleTasksToExecution,
}