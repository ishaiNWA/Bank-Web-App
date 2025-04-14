
const{Schema, model} = require("mongoose");
const TRANSACTION_TASK = 'TRANSACTION'

const scheduledBankTaskSchema = new Schema({
    requestID :{
        type: String,
        required: true,
    },
    senderEmail : {
        type: String,
        required: true,
    },
    recipientEmail  : {
        type: String,
        required: true,
    },
    taskType :  {
        type: String,
        enum: Object.values(TRANSACTION_TASK),
        required: true,
    },
    amount : {
        type : Number,
        required: true,
    },
    nextPayment: {
        type: Date,
        required: true,
    },
    paymentFrequency:{
        type : Number,
        required: true,
        description: "Frequency in months between payments"
    },
    totalPayments : {
        type : Number,
        required: true,
    },
    paymentsDone : {
        type : Number,
        default: 0,
    },
});

scheduledBankTaskSchema.index({ nextPayment: 1 });

const ScheduledBankTask =  model("ScheduledBankTask" , scheduledBankTaskSchema );

module.exports = ScheduledBankTask;