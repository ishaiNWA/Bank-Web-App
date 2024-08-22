require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../model/User");
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

async function findUserBalance(email) {
  const userBalance = await User.findOne(
    { email: email },
    { balance: 1, _id: 0 },
  );
  return userBalance.balance;
}

/*****************************************************************************/

async function addToRecipient(recipientEmail, amount, session = null) {
  await User.updateOne(
    { email: recipientEmail },
    { $inc: { balance: amount } },
    { session },
  );
}
/*****************************************************************************/

async function subtractFromSender(userEmail, amount, session = null) {
  const userBalance = await User.findOneAndUpdate(
    { email: userEmail },
    { $inc: { balance: -amount } },
    { new: true, select: "balance", session },
  );

  return userBalance.balance;
}
/*****************************************************************************/

async function deletePendingUserByEmail(email, session = null) {
  await PendingUser.deleteOne(
    {
      userEmail: email,
    },
    { session },
  );
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

async function createPendingUser(pendingUserObj, session = null) {
  await PendingUser.create(
    [
      {
        name: pendingUserObj.name,
        confirmationPassword: pendingUserObj.confirmationPassword,
        userEmail: pendingUserObj.userEmail,
        userHashedPassword: pendingUserObj.userHashedPassword,
        salt: pendingUserObj.salt,
      },
    ],

    { session },
  );
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

async function findUsersTransactions(email, offset, limit) {
  const userObj = await User.findOne({ email: email })
    .select("recentTransactions")
    .populate({
      path: "recentTransactions",
      options: {
        sort: { _id: -1 },
        skip: offset,
        limit: limit,
      },
    })
    .lean();

  if (!userObj) {
    throw new Error("User not found");
  }

  return userObj.recentTransactions;
}

// return await await Transaction.fi})nd({
//   $or: [{ senderEmail: mail }, { recipientEmail: mail }],
// })
//   .sort({ date: -1 })
//   .skip(offset)
//   .limit(limit)
//   .exec();

/*****************************************************************************/

async function registerTransaction(
  userEmail,
  recipientEmail,
  amount,
  session = null,
) {
  const transactionObjs = await Transaction.create(
    [
      {
        senderEmail: userEmail,
        recipientEmail: recipientEmail,
        amount: amount,
      },
    ],

    { session },
  );

  const transactionObj = transactionObjs[0];
  await indexTransaction(
    transactionObj._id,
    userEmail,
    recipientEmail,
    session,
  );
}
/*****************************************************************************/

async function indexTransaction(
  transactionId,
  senderEmail,
  recipientEmail,
  session,
) {
  const res = await User.updateMany(
    { email: { $in: [senderEmail, recipientEmail] } },
    {
      $push: {
        recentTransactions: transactionId,
      },
    },
    { session },
  );
}

/*****************************************************************************/

module.exports = {
  mongoose,
  connectToDB,
  findUserByEmail,
  deletePendingUserByEmail,
  createPendingUser,
  findAndDeletePendingUser,
  createUser,
  createBlackListedToken,
  isBlackListedToken,
  findUsersTransactions,
  addToRecipient,
  subtractFromSender,
  registerTransaction,
  findUserBalance,
};
