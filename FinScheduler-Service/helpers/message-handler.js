const logger = require("./logger");

async function msgHandler(msg){


   const finTaskObj = JSON.parse(msg.content.toString('utf8'));

   logger.info(JSON.stringify(finTaskObj));
    let requestID = finTaskObj.requestID;
    return requestID;
}

module.exports = msgHandler;