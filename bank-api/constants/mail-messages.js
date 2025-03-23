const USER_ROLES = require("./roles");
const osService = require("../services/os-service");

const MAIL_MESSAGES = Object.freeze({
  CLIENT_CONFIRMATION_MSG: (confirmationCode) => `Please send this code to http://${osService.getServerIP()}:${process.env.PORT}/api/connection/register-confirmation
Your code is: ${confirmationCode}
Thank you for registering with our service.`,

  MANAGER_INVITATION_MSG: (confirmationCode) => `You are invited to be a manager in our system.
Please set a password for your account, and send it along with
this code to http://${osService.getServerIP()}:${process.env.PORT || 3000}/api/connection/register-manager
Your code is: ${confirmationCode}
Thank you for registering with our service.`
});

function getConfirmationMsg(confirmationCode, role) {
  if (role === USER_ROLES.MANAGER) {
    return MAIL_MESSAGES.MANAGER_INVITATION_MSG(confirmationCode);
  } else if (role === USER_ROLES.CLIENT) {
    return MAIL_MESSAGES.CLIENT_CONFIRMATION_MSG(confirmationCode);
  }
}

module.exports = {getConfirmationMsg};
