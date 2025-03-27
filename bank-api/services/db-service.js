const mongoose = require("mongoose");
const User = require("../model/User");
const PendingUser = require("../model/PendingUsers");
const Transaction = require("../model/Transactions");
const BlackListedToken = require("../model/BlackListedToken");
const ManagerInvitation = require("../model/ManagerInvitation");
const Account = require("../model/Account");
const { json } = require("body-parser");
const BadQueryError = require("../errors/BadQueryError")

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

// async function findUserBalance(email) {
//   const userBalance = await User.findOne({ email: email }, { balance: 1, _id: 0 });
//   return userBalance.balance;
// }

/*****************************************************************************/

async function findUserBalance(email){
   const userDoc = await User.findOne({email : email}).populate(`account`);

   if(!userDoc){
    throw new BadQueryError(`the  user: ${email} was not found in system`)
   };
   if(!userDoc.account){
    throw new BadQueryError(`no account for ${email} user.`);
   }

   return userDoc.account.balance;
}
/*****************************************************************************/

async function addToRecipient(recipientEmail, amount, session = null) {
  const userDoc = await User.findOne({ email: recipientEmail });
  await Account.findOneAndUpdate({_id: userDoc.account},
  {$inc: { balance: amount } },
  {  new: true, session }
  )
}
/*****************************************************************************/

async function subtractFromSender(userEmail, amount, session = null) {
  
  const userDoc = await User.findOne({ email: userEmail });

  const updatedAccount = await Account.findOneAndUpdate(
    { _id: userDoc.account },
    { $inc: { balance: -amount } },
    { new: true, session }
  );

  return updatedAccount.balance;
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
  const userDoc = await User.findOne({ email: email }).populate({
    path :`account`,
    populate: {
      path: `recentTransactions`,
      options: {
        sort: { _id: -1 },
        skip: offset,
        limit: limit,
      }
    }
  });

  if(!userDoc){
    throw new BadQueryError(`the  user: ${email} was not found in system`)
   };
   if(!userDoc.account){
    throw new BadQueryError(`no account for ${email} user.`);
   }

  return userDoc.account.recentTransactions;
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

  const senderAccountId = await findUserAccountId(userEmail)
  const recipientAccountId = await findUserAccountId(recipientEmail);

  const transactionObj = transactionObjs[0];
  await indexTransaction(transactionObj._id, senderAccountId, recipientAccountId, session);
}
/*****************************************************************************/

async function indexTransaction(transactionId, senderAccountId, recipientAccountId, session) {
  const res = await Account.updateMany(
    { _id: { $in: [senderAccountId, recipientAccountId] } },
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

async function extractPropertyFromDoc(modelName , docUniqueIdentifierObj, property ){
 const result = await mongooseModel.findOne(docUniqueIdentifierObj,{[property] : 1} );
return result
}
/*****************************************************************************/

async function findUserAccountId(email){
  const userDoc = await User.findOne({email : email});
  if (!userDoc){
    throw new BadQueryError("unfound user");
  }
  return userDoc.account;
}


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
