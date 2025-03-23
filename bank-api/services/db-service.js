const mongoose = require("mongoose");
const User = require("../model/User");
const PendingUser = require("../model/PendingUsers");
const Transaction = require("../model/Transactions");
const BlackListedToken = require("../model/BlackListedToken");
const ManagerInvitation = require("../model/ManagerInvitation");
const Account = require("../model/Account");
const { json } = require("body-parser");

/*****************************************************************************/

async function connectToDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("connection was made to: ", process.env.MONGODB_URI);
}
/*****************************************************************************/

/**
 * Executes database operations within a transaction
 * @param {function(session: mongoose.ClientSession): Promise<any>} dbExecutedOperations - Function that receives a session and returns a promise
 * @returns {Promise<any>} The result of the executed operations
 */

async function executeWithTransaction(operationsCallback) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await operationsCallback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

/*****************************************************************************/
async function findUserByEmail(email) {
  return await User.findOne({ email: email });
}
/*****************************************************************************/

async function findUserBalance(email) {
  const userBalance = await User.findOne({ email: email }, { balance: 1, _id: 0 });
  return userBalance.balance;
}

/*****************************************************************************/

async function addToRecipient(recipientEmail, amount, session = null) {
  await User.updateOne({ email: recipientEmail }, { $inc: { balance: amount } }, { session });
}
/*****************************************************************************/

async function subtractFromSender(userEmail, amount, session = null) {
  const userBalance = await User.findOneAndUpdate(
    { email: userEmail },
    { $inc: { balance: -amount } },
    { new: true, select: "balance", session }
  );

  return userBalance.balance;
}
/*****************************************************************************/

async function deletePendingUserByEmail(email, session = null) {
  await PendingUser.deleteOne(
    {
      userEmail: email,
    },
    { session }
  );
}
/*****************************************************************************/

async function deleteManagerInvitationByEmail(email, session = null) {
  return await ManagerInvitation.deleteOne({ email: email }, { session });
}
/*****************************************************************************/

async function createUser(userObj, session = null) {
  return await User.create([userObj], { session }).then((usersArray) => usersArray[0]); // as a document with session created as an array,
  //returning only the first index
}
/*****************************************************************************/

async function createPendingUser(pendingUserObj, session = null) {
  await PendingUser.create(
    [
      pendingUserObj,
    ],

    { session }
  );
}
/*****************************************************************************/

async function findAndDeletePendingUser(confirmationCode, minSubmitionTime) {
  return await PendingUser.findOneAndDelete({
    confirmationCode: confirmationCode,
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

async function findUsersTransactions(email, offset, limit = null) {
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

/*****************************************************************************/

async function registerTransaction(userEmail, recipientEmail, amount, session = null) {
  const transactionObjs = await Transaction.create(
    [
      {
        senderEmail: userEmail,
        recipientEmail: recipientEmail,
        amount: amount,
      },
    ],

    { session }
  );

  const transactionObj = transactionObjs[0];
  await indexTransaction(transactionObj._id, userEmail, recipientEmail, session);
}
/*****************************************************************************/

async function indexTransaction(transactionId, senderEmail, recipientEmail, session) {
  const res = await User.updateMany(
    { email: { $in: [senderEmail, recipientEmail] } },
    {
      $push: {
        recentTransactions: transactionId,
      },
    },
    { session }
  );
}

/*****************************************************************************/

async function createManagerInvitation(managerInvitationObj, session = null) {
  return await ManagerInvitation.create([managerInvitationObj], { session });
}

/*****************************************************************************/

async function findManagerInvitationByEmail(email) {
  return await ManagerInvitation.findOne({ email: email });
}
/*****************************************************************************/

async function createAccount(userObjectId, session = null) {
  return await Account.create(
    [
      {
        accountHolder: userObjectId,
      },
    ],
    { session }
  ).then((accountArray) => accountArray[0]); // as a document with session created as an array,
  //returning only the first index
}

/*****************************************************************************/

async function addAccountToUser(userObjectId, accountObjectId, session = null) {
  return await User.findOneAndUpdate(
    { _id: userObjectId },
    { $set: { account: accountObjectId } },
    { new: true, session, runValidators: true }
  );
}

/*****************************************************************************/
module.exports = {
  mongoose,
  connectToDB,
  findUserByEmail,
  deletePendingUserByEmail,
  findAndDeletePendingUser,
  createUser,
  createManagerInvitation,
  findManagerInvitationByEmail,
  createBlackListedToken,
  createPendingUser,
  isBlackListedToken,
  findUsersTransactions,
  addToRecipient,
  subtractFromSender,
  registerTransaction,
  findUserBalance,
  executeWithTransaction,
  deleteManagerInvitationByEmail,
  createAccount,
  addAccountToUser,
};
