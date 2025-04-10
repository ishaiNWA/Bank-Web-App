const amqp = require("amqplib");
const logger = require("../helpers/logger");
const msgHandler = require("../helpers/message-handler");
const {sleep} = require("../helpers/utils");

let rabbitConnection;
let rabbitChannel;
const INITIAL_PUBLISH_WAITING_TIME_MS = 1000;
const MAX_PUBLISH_ATTEMPTS = 3;


async function initAndListen(){
    try {
        await connectToRabbitService();
        await setupExchangeAndQueue();

        logger.info(`app successfully connected to rabbit-service server at: ${process.env.RABBIT_CONNECTION_URL}`);
        
      } catch (error) {
        logger.error({msg:`rabbitMQ initiation failed due to ${error.message}`,
          error: error}
        );
        throw error;
      }
      consumeMessages();
} 


async function connectToRabbitService(){
     rabbitConnection = await amqp.connect(process.env.RABBIT_CONNECTION_URL);
    if (!rabbitConnection) {
        throw new Error('Failed to establish connection to RabbitMQ');
      }

      rabbitChannel = await rabbitConnection.createConfirmChannel();

    
}

async function setupExchangeAndQueue(){

    await rabbitChannel.assertExchange(process.env.RABBIT_EXCHANGE_NAME,process.env.RABBIT_EXCHANGE_TYPE,
        { durable: true },
    )

    await rabbitChannel.assertQueue(process.env.RABBIT_QUEUE_NAME,{ durable: true});
    await rabbitChannel.bindQueue(
        process.env.RABBIT_QUEUE_NAME,
        process.env.RABBIT_EXCHANGE_NAME,
        process.env.RABBIT_ROUTING_KEY
    );
}



/**
 * @desc Sets up a RabbitMQ consumer that delegates all message processing to msgHandler.
 * * Messages are processed asynchronously in the background.
 *  @param {Function} msgHandler - Async function responsible for message processing, acknowledgment and error handling.
 */
function consumeMessages(){
    
    let requestId;

    rabbitChannel.consume( process.env.RABBIT_QUEUE_NAME,
        async function processQueueMessage(msg){
        logger.info(`A rabbit message was fetched and is now being handled...`);

        let waitingTime = INITIAL_PUBLISH_WAITING_TIME_MS;
        for(let attempt = 0 ; attempt < MAX_PUBLISH_ATTEMPTS ; attempt++){
        try{
            requestId = await msgHandler(msg);
            rabbitChannel.ack(msg);
            logger.info(`\n\n request: ${requestId} was handled successfully`)
            return;
        }catch(error){
         
            if(attempt + 1 === MAX_PUBLISH_ATTEMPTS){
                logger.error(`failed to process rabbit message after max attempt of ${MAX_PUBLISH_ATTEMPTS}`)
                await rabbitChannel.nack(msg, false, false); // will  NOT requeue the message after MAX attamtps failure.
                // TODO :: send failure message to API server for this request ID
                return;
            }

            logger.info(` ${attempt + 1} to process message was failed, retry again in a few seconds...`);
            await sleep(waitingTime);
            waitingTime *= 2;
            continue;
        }
    }

    },
    {
        noAck: false, //messages will be dequeued only after specifically acknowledged
    },
)
}


module.exports = {
    initAndListen,
}