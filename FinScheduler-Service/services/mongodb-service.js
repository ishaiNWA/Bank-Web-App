const mongoose = require("mongoose");
const logger = require ("../helpers/logger");

/******************************************************************************/
async function connect(){
   await mongoose.connect(process.env.MONGODB_URI);
   logger.info("App successfully connected to mongoose Atlas service");
}

/******************************************************************************/

/**
 * 
 * @desc find documents by a filtering Object
 * @returns  returns an array of documents matching your filter criteria. Even if no documents match your criteria, it will return an empty array ([]), not null or undefined.
 */
async function findDocuments(collection ,filteringObj){

    let foundDocuments;
    try{
        foundDocuments = await collection.find(filteringObj);
        logger.info(`successfully found ${foundDocuments.length} documents in ${collection.modelName} collection`);    
    }catch(error){
      logger.error(`unexpected error during find attempt in ${collection.modelName} collection: ${error.message}`);
      throw error;
    }

    return foundDocuments; 
}
/******************************************************************************/
/**
 * 
 * @desc creates a new document in a collection according to passed document
 * @returns the new document
 */
async function createNewDocument(collection, documentObj) {
    let newDocument;
    try {
      newDocument = await collection.create(documentObj);
      logger.info(`Successfully created a new document in ${collection.modelName} collection`);
    } catch (error) {
      logger.error(`unexpected error during create document attempt in ${collection.modelName} collection: ${error.message}`);
      throw error;
    }
    return newDocument;
  }

/******************************************************************************/

/**
 * @desc delete a single document from database
 * @returns boolean value for whether a document was found and deleted
 */
async function deleteSingleDocument(collection, filteringObj){

  let res;
  try{
    res = await collection.deleteOne(filteringObj);
    logger.info(`found and deleted ${res.deletedCount} documents`);
  }catch(error){
    logger.error(`unexpected error during deleteOne attemtp in in ${collection.modelName} collection: ${error.message}`)
    throw error;
  }

  return (res.deletedCount > 0);
}

/******************************************************************************/

/**
 * @desc update an existing document in the data base
 * @returns res object with two properties:
*   matchedCount: Tells you if a document matching your filter was found
* modifiedCount: Tells you if the document was actually modified (might be 0 if the document already had the exact values you're setting)
 */
async function updateDocument(collection , updatedDocument , filteringObj){

  let res;
  try{
    res = await collection.updateOne(filteringObj , {$set:updatedDocument});
  }catch(error){
    logger.error(`unexpected error during updateOne attemtp in in ${collection.modelName} collection: ${error.message}`)
    throw error;
  }

  if(res.matchedCount > 0){
    logger.info(`Successfully updated a document in ${collection.modelName} collection for id${updatedDocument._id}`)
  }else{
    logger.info(`could not find and update a document in ${collection.modelName} collection for id${updatedDocument._id}`)
  }

 return res;
}

/******************************************************************************/

module.exports = {
  connect,
  createNewDocument,
  updateDocument,
  deleteSingleDocument,
  findDocuments,
}