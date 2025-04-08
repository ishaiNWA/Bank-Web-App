const USER_ROLES = require("./roles");
const osService = require("../services/os-service");

const MAIL_MESSAGES = Object.freeze({

  REGISTER_CONFIRMATION:{
  CLIENT_CONFIRMATION_MSG: (confirmationCode) => `Please send this code to http://${osService.getServerIP()}:${process.env.PORT}/api/connection/register-confirmation
Your code is: ${confirmationCode}
Thank you for registering with our service.`,

  MANAGER_INVITATION_MSG: (confirmationCode) => `You are invited to be a manager in our system.
Please set a password for your account, and send it along with
this code to http://${osService.getServerIP()}:${process.env.PORT || 3000}/api/connection/register-manager
Your code is: ${confirmationCode}
Thank you for registering with our service.`
  },

  SCHEDULED_TASK_SUBMISSION_MSG: (scheduledTaskForm)=> `scheduled task was submitted and will be executed regularly as described in the form.\n
  A message to this mail will be sent after every task execution.\n
  task description : \n ${JSON.stringify(scheduledTaskForm)}`
,

});

function getRegisterConfirmationMsg(confirmationCode, role) {
  if (role === USER_ROLES.MANAGER) {
    return MAIL_MESSAGES.REGISTER_CONFIRMATION.MANAGER_INVITATION_MSG(confirmationCode);
  } else if (role === USER_ROLES.CLIENT) {
    return MAIL_MESSAGES.REGISTER_CONFIRMATION.CLIENT_CONFIRMATION_MSG(confirmationCode);
  }
}

function getScheduledTaskSubmissionMsg(scheduledTaskForm){
  return MAIL_MESSAGES.SCHEDULED_TASK_SUBMISSION_MSG(scheduledTaskForm);
}

module.exports = {
  getRegisterConfirmationMsg,
  getScheduledTaskSubmissionMsg
};
