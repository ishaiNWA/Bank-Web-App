require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../model/User");
const Balance = require("../model/Balance");
const PendingUser = require("../model/PendingUsers");

async function connectToDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("connection DB");
}

/*****************************************************************************/

async function isUniqueEmail(email) {
  return await User.findOne({ email: userEmail });
}
/*****************************************************************************/

module.exports = {
  connectToDB,
  isUniqueEmail,
};
