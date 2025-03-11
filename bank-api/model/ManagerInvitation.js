//import mongoose from 'mongoose';
const mongoose = require("mongoose");
const USER_ROLES = require("../constants/roles");
const ONE_HOUR_MS = 60 * 60 * 1000;

const { Schema, model } = mongoose;

const managerInvitationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },

  role: {
    type: String,
    enum: [USER_ROLES.MANAGER, USER_ROLES.ADMIN],
    required: true,
  },
  hashedToken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: process.env.MANAGER_INVITATION_EXP_TIME || ONE_HOUR_MS,
  },
});

const ManagerInvitation = model("ManagerInvitation", managerInvitationSchema);

module.exports = ManagerInvitation;
