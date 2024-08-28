require("dotenv").config();
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
    expires: parseInt(process.env.BLACK_LISTED_TOKEN_EXPIRATION_SECONDS),
  },
});

const BlackListedToken = model("BlackListedToken", blackListedTokensSchema);

module.exports = BlackListedToken;
