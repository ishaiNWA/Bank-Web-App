require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../model/User");
const Balance = require("../model/Balance");
const PendingUser = require("../model/PendingUsers");
const Transaction = require("../model/Transactions");
const BlackListedToken = require("../model/BlackListedToken");

/*****************************************************************************/

async function connectToDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("connection DB");
}
/*****************************************************************************/

async function findUserByEmail(email) {
  return await User.findOne({ email: email });
}
/*****************************************************************************/

async function findBalanceByEmail(email) {
  return await Balance.findOne({ email: email });
}
/*****************************************************************************/

async function addToRecipient(recipientEmail, amount) {
  return await Balance.findOneAndUpdate(
    { email: recipientEmail },
    { $inc: { balance: amount } },
  );
}
/*****************************************************************************/

async function subtractFromSender(userEmail, amount) {
  return await Balance.findOneAndUpdate(
    { email: userEmail },
    { $inc: { balance: -amount } },
    { new: true },
  );
}
/*****************************************************************************/

async function deletePendingUserByEmail(email) {
  await PendingUser.deleteOne({
    userEmail: email,
  });
}
/*****************************************************************************/

async function createUser(userObj) {
  await User.create({
    name: userObj.name,
    email: userObj.email,
    hashedPassword: userObj.hashedPassword,
    salt: userObj.salt,
  });
}
/*****************************************************************************/

async function createPendingUser(pendingUserObj) {
  await PendingUser.create({
    name: pendingUserObj.name,
    confirmationPassword: pendingUserObj.confirmationPassword,
    userEmail: pendingUserObj.userEmail,
    userHashedPassword: pendingUserObj.userHashedPassword,
    salt: pendingUserObj.salt,
  });
}
/*****************************************************************************/

// should go into USER document
async function createBalance(email) {
  await Balance.create({
    email: email,
  });
}
/*****************************************************************************/

async function findAndDeletePendingUser(
  confirmationPassword,
  minSubmitionTime,
) {
  return await PendingUser.findOneAndDelete({
    confirmationPassword: confirmationPassword,
    submissionTime: { $gte: minSubmitionTime },
  });
}
/*****************************************************************************/

async function createBlackListedToken(token) {
  await BlackListedToken.create({
    token: token,
  });
}
/*****************************************************************************/

async function isBlackListedToken(token) {
  return !!(await BlackListedToken.findOne({ token: token }));
}
/*****************************************************************************/
async function findUsersTransactions(mail, offset, limit) {
  return await await Transaction.find({
    $or: [{ senderEmail: mail }, { recipientEmail: mail }],
  })
    .sort({ date: -1 })
    .skip(offset)
    .limit(limit)
    .exec();
}
/*****************************************************************************/

async function registerTrasaction(userEmail, recipientEmail, amount) {
  await Transaction.create({
    senderEmail: userEmail,
    recipientEmail: recipientEmail,
    amount: amount,
  });
}
/*****************************************************************************/

module.exports = {
  connectToDB,
  findUserByEmail,
  deletePendingUserByEmail,
  createPendingUser,
  findAndDeletePendingUser,
  createUser,
  createBalance,
  createBlackListedToken,
  isBlackListedToken,
  findBalanceByEmail,
  findUsersTransactions,
  addToRecipient,
  subtractFromSender,
  registerTrasaction,
};
