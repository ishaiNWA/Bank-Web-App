//import mongoose from 'mongoose';
const mongoose = require("mongoose");
const USER_ROLES = require("../constants/roles");

const { Schema, model } = mongoose;

// Define the schema for a User
const userSchema = new Schema({
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
  hashedPassword: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    deafult: USER_ROLES.CLIENT,
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

// Create a model using the schema
const User = model("User", userSchema);

module.exports = User;
