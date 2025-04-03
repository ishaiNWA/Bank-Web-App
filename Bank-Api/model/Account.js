const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const accountSchema = new Schema({
  accountHolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    default: 1000,
  },
  recentTransactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  ],
});

const account = model("Account", accountSchema);

module.exports = account;
