const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ONE_HR_EXP_TIME_IN_SEC = 60 * 60;
const USER_ROLES = require("../constants/roles")
const pendingUserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  confirmationCode: {
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
    required: false,
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    required: true,
  },
  submissionTime: {
    type: Date,
    default: Date.now,
    expires: parseInt(
      process.env.PENDING_USER_EXPIRATION_SECONDS || ONE_HR_EXP_TIME_IN_SEC
    ),
  },
});

const pendingUser = model("PendingUser", pendingUserSchema);
module.exports = pendingUser;
