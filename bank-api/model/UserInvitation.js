//import mongoose from 'mongoose';
const mongoose = require("mongoose");
const ONE_HOUR_MS = 60 * 60 * 1000;

const { Schema, model } = mongoose;

const userInvitationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["client", "manager"],
    deafult: "client",
  },
  hashedToken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: process.env.USER_INVITATION_EXP_TIME || ONE_HOUR_MS,
  },
});

const UserInvitation = model("UserInvitation", userInvitationSchema);

module.exports = UserInvitation;
