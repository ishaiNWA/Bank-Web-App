const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const transactionsSchema = new Schema({
  senderEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  recipientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  standingOrderRequestId: {
    type: String,
    required : false,
  }
});

const Transactions = model("Transaction", transactionsSchema);
module.exports = Transactions;
