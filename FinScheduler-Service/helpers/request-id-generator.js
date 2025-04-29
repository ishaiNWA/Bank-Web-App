const { v4: uuidv4 } = require('uuid');
const REQUEST_ID_PREFIX = "bank_app_request_"

//application-wide middleware that adds a unique ID to each request for tracking and debugging purposes
function generateRequestId(req ,res ,next){

   req.requestID = REQUEST_ID_PREFIX +  uuidv4() + " -0";
   next()
}


module.exports = generateRequestId;