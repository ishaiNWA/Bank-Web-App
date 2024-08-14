const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const balanceSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  balance: {
    type: Number,
    default: 1000,
  },
});

const Balance = model("Balance", balanceSchema);

module.exports = Balance;
