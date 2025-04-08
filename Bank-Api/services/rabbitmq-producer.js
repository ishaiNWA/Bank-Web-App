const amqp = require('amqplib');

let rabbitConnection;
let rabbitChannel;
const INITIAL_PUBLISH_WAITING_TIME_MS = 1000;
const MAX_PUBLISH_ATTEMPTS = 3;
const {sleep} = require("../helpers/utils");

/*****************************************************************************/

async function init() {
    try {
      await connectToRabbit();
      await setupExchangeAndQueue();
    } catch (err) {
      console.error({msg:`rabbitMQ initiation failed: ${err.message}`,
        error: err}
      );
      throw new Error("RabbitmqService failed to init");
    }
  }
  
/*****************************************************************************/

async function connectToRabbit() {
    console.log(`RABBIT_CONNECTION_URL is: ${process.env.RABBIT_CONNECTION_URL}`)
    rabbitConnection = await amqp.connect(process.env.RABBIT_CONNECTION_URL);
    if (!rabbitConnection) {
        throw new Error('Failed to establish connection to RabbitMQ');
      }
      
    rabbitChannel = await rabbitConnection.createConfirmChannel();
    console.log({msg: `Computations-Servise app successfully connected to rabbit-service server at: 
    ${process.env.RABBIT_CONNECTION_URL}`} );
  }

  /*****************************************************************************/

  /**
 * Sets up RabbitMQ exchange and queue with specified configuration
 * @async
 * @throws Error When exchange or queue setup fails
 */
async function setupExchangeAndQueue() {
    await rabbitChannel.assertExchange(process.env.RABBIT_EXCHANGE_NAME,
        process.env.RABBIT_EXCHANGE_TYPE,
      { durable: true }
    );
    await rabbitChannel.assertQueue(process.env.RABBIT_QUEUE_NAME, {
      durable: true,
    });
    await rabbitChannel.bindQueue(
        process.env.RABBIT_QUEUE_NAME,
        process.env.RABBIT_EXCHANGE_NAME,
        process.env.RABBIT_ROUTING_KEY
    );
  }

/*****************************************************************************/

/**
 * Publishes a message to RabbitMQ with confirmation and retry logic
 * 
 * @param {Buffer} msg - The message to publish, already serialized as a Buffer
 *                       (Caller is responsible for converting objects to Buffer
 *                       using Buffer.from(JSON.stringify(obj)) before calling)
 * @returns {Promise<void>} - Resolves when message is successfully published
 * @throws {Error} - Throws an error after MAX_PUBLISH_ATTEMPTS failed attempts
 *                   Error contains stringified JSON with requestID, message, and error details
 */
  async function publishMessage(msg){
   
    let waitingTime = INITIAL_PUBLISH_WAITING_TIME_MS;
    for(let attempt = 1; attempt <= MAX_PUBLISH_ATTEMPTS ; attempt ++){
      try{
      rabbitChannel.publish(
      process.env.RABBIT_EXCHANGE_NAME,
      process.env.RABBIT_ROUTING_KEY,
      msg
      );
      await rabbitChannel.waitForConfirms(waitingTime);
      console.log(`Rabbit message successfully published on attempt ${attempt}.`)
      return;
      }catch(error){

        if(attempt + 1 > MAX_PUBLISH_ATTEMPTS){
          throw new Error(JSON.stringify({
            requestID: msg.requestID,
            message: `Failed to publish a Rabbit message after the max attempts (${MAX_PUBLISH_ATTEMPTS}).`,
            error: error.message
          }));
        }
        console.log(`Failed to publish rabbit message on attempt ${attempt + 1} due to: ${error.message}.\n
          Retrying in ${waitingTime}ms...`);

      await sleep(waitingTime);   
        waitingTime *= 2;
        continue;
      } 
    }
  }

/*****************************************************************************/


  
module.exports={
  init,
  publishMessage,
}