
const{Schema, model} = require("mongoose");
const generateRequestId = require("../helpers/request-id-generator")
const TRANSACTION_TASK = 'TRANSACTION'

const scheduledFinTaskSchema = new Schema({
    scheduledFinTaskID :{
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
    nextPaymentRequestId :{
        type: String,
        required: false, // is generated automatically before each save
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

scheduledFinTaskSchema.index({ nextPayment: 1 });

scheduledFinTaskSchema.pre("save", function(next){
    this.nextPaymentRequestId = generateRequestId();
    next();
})

const ScheduledFinTask =  model("ScheduledFinTask" , scheduledFinTaskSchema );

module.exports = ScheduledFinTask;