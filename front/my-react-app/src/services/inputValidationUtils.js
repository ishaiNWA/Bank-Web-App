// Input Validation Utility Functions

/*****************************************************************************/

export const isValidName = (name) => {
  const nameRegex = /^[a-zA-Z]{1,20}$/;
  return nameRegex.test(name);
};

/*****************************************************************************/

export const isValidEmailAddress = (email) => {
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

/*****************************************************************************/

export const isValidPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,20}$/;
  return passwordRegex.test(password);
};

/*****************************************************************************/

export const isMatchingPasswords = (password, passwordConfirmation) =>
  password === passwordConfirmation;

export const isValidTransactionAmount = (amount) => {
  const regex = /^[1-9]\d*$/;
  return regex.test(amount);
};

/*****************************************************************************/
