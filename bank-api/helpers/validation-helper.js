const dbClient = require("../services/db-service")
const validator = require("email-validator");

/*****************************************************************************/

async function isUniqueUserName(userEmail) {
  if (await dbClient.findUserByEmail(userEmail)) {
    throw new Error(
      `The email ${userEmail} already exists. Please register with a different email address.`
    );
  }
  return true;
}

/*****************************************************************************/
function isValidName(name) {
  const nameRegex = /^[a-zA-Z]{1,20}$/;
  console.log(`name : ${name}`)
  const isValidName = nameRegex.test(name);
  if (!name || !isValidName) {
    throw new Error("Name must contain only letters and be between 1-20 characters long");
  }
  return true;
}

/*****************************************************************************/

function isValidPasswordFormat(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,20}$/;
  const isValidPassword = passwordRegex.test(password);
  if (!password || !isValidPassword) {
    throw new Error(
      "Must pass a password of 5-20 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*)"
    );
  }
  return true;
}
/*****************************************************************************/

function isValidEmailFormat(userEmail) {
  if (!userEmail || !validator.validate(userEmail)) {
    throw new Error("invalid email format");
  }
  return true;
}

module.exports = {
  isValidEmailFormat,
  isValidName,
  isValidPasswordFormat,
  isUniqueUserName,
};
