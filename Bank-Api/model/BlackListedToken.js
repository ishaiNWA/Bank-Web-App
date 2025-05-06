const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const DEAFULT_EXP_TIME_IN_SEC = 60 * 60 * 24;

const blackListedTokensSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: parseInt(
      process.env.BLACK_LISTED_TOKEN_EXPIRATION_SECONDS ||
        DEAFULT_EXP_TIME_IN_SEC
    ),
  },
});

/**
 * @module BlackListedToken
 * @description Schema for tracking invalidated authentication tokens to prevent their reuse
 */
const BlackListedToken = model("BlackListedToken", blackListedTokensSchema);

module.exports = BlackListedToken;
