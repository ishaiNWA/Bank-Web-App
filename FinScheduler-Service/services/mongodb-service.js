const mongoose = require("mongoose");
const ScheduledBankTask = require("../models/ScheduledFinTask")
const logger = require ("../helpers/logger");

/******************************************************************************/
async function connect(){
   await mongoose.connect(process.env.MONGODB_URI);
   logger.info("App successfully connected to mongoose Atlas service");
}

/******************************************************************************/
async function getReadyToExecuteTasks(){
    
    const latestExecutionTime = new Date();
    latestExecutionTime.setHours(23,59,59,999);

    const filteringObj = {
        nextPayment : { $lt : latestExecutionTime}
    }
    return await findDocuments(ScheduledBankTask , filteringObj);
}

/******************************************************************************/
async function findDocuments(collection ,filteringObj){

    let foundDocuments;
    try{
        foundDocuments = await collection.find(filteringObj);
        logger.info(`Successfully found ${foundDocuments.length} documents in ${collection.modelName} collection`);
    
    }catch(error){
        logger.error(`Failed to retrieve documents in ${collection.modelName} collection: ${error.message}`);
        throw error;
    }

    return foundDocuments; 
}

/******************************************************************************/
async function pushScheduledFinTaskToDb(finTaskObj, context){

  return await createNewDocument(ScheduledBankTask ,finTaskObj , context);
}

/******************************************************************************/
async function createNewDocument(collection, documentObj, context) {
    let newDocument;
    try {
      // Notice the correction here - passing documentObj directly, not wrapped in {finTaskObj}
      newDocument = await collection.create(documentObj);
      logger.info(`Successfully created a new document in ${collection.modelName} collection`);
    } catch (error) {
      logger.error(`Failed to create a new document in ${collection.modelName} collection: ${error.message}`);
      throw error;
    }
    return newDocument;
  }

/******************************************************************************/

module.exports = {
    connect,
    pushScheduledFinTaskToDb,
    getReadyToExecuteTasks,
}