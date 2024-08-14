const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const blackListedTokensSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // 3600 seconds = 1 hour
  },
});

const BlackListedToken = model("BlackListedToken", blackListedTokensSchema);

module.exports = BlackListedToken;
