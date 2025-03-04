const mongoose = require("mongoose");
const { Schema, model } = mongoose;

accountSchema = new Schema({
  accountHolder: {
    type: mongoose.Schema.Types.ObjectId,
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

const account = model("Acount", accountSchema);

module.exports = account;
