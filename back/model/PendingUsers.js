const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const pendingUserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  confirmationPassword: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  userHashedPassword: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  submissionTime: {
    type: Date,
    default: Date.now,
  },
});

const pendingUser = model("PendingUser", pendingUserSchema);
module.exports = pendingUser;
