

import {
  sendRequest,
  REGISTER_URL,
  REGISTER_CONFIRMATION_URL,
  LOGIN_URL
} from "./ApiUtils";

import {
  isValidName,
  isValidPassword,
  isMatchingPasswords,
  isValidEmailAddress,
}from "./inputValidationUtils";

const INVALID_PASSWORD_MSG = `
      Your password must meet the following criteria:
      1. At least 5 characters long
      2. No more than 20 characters long
      3. At least one uppercase letter (A-Z)
      4. At least one lowercase letter (a-z)
      5. At least one digit (0-9)
      6. At least one special character (!@#$%^&*)
      `;

export const registerHandler = async (registerDataObj) => {

  const { method, registerCredentials, setOpenModel } = registerDataObj;

  var inValidationMessage = isValidRegisterCredentials(registerCredentials);
  if (inValidationMessage) {
    alert(inValidationMessage);

  } else {

    const requestBody = BuildRequestBody(registerCredentials);
    const res = await sendRequest(method, REGISTER_URL, requestBody ,null ,null);

    alert(res.data.explanation);
    if (res.status === 200) {
      console.log("success");
      setOpenModel(true);
    } else {
      console.log("fail");

    }
  }
}

function BuildRequestBody(registerCredentials) {

  return ({
    name: null != registerCredentials.name ? registerCredentials.name : null,
    userEmail: registerCredentials.email,
    password: registerCredentials.password
  })
}

function isValidRegisterCredentials(registerCredentials) {

  if (!isValidName(registerCredentials.name)) {

    return "name should be 1-20 only upper/lower case letters"
  }

  if (!isValidEmailAddress(registerCredentials.email)) {

    return "invalid email address";
  }

  if (!isValidPassword(registerCredentials.password)) {

    return INVALID_PASSWORD_MSG;
  }

  if (!isMatchingPasswords(registerCredentials.password, registerCredentials.passwordConfirmation)) {

    return 'confirm your password again';
  }

  return null;

}


export const confirmationHandler = async (confirmationHandlerDataObj) => {

  const { method, confirmationPassword, registerEmail, password, navigate } = confirmationHandlerDataObj;

  const requestBody = {
    confirmationPassword: confirmationPassword
  };

  const res = await sendRequest(method, REGISTER_CONFIRMATION_URL, requestBody ,null ,null);

  if (res.status === 200) {
    console.log("success");
    LoginHandler({ userEmail: registerEmail, password, navigate });
  }
}

export const LoginHandler = async (loginDataObj) => {

  const { userEmail, password, navigate } = loginDataObj;

  console.log(loginDataObj);

  if (!isValidEmailAddress(userEmail)) {
    alert("invalid email address");
    return;
  }
  if (!isValidPassword(password)) {
    alert(INVALID_PASSWORD_MSG);
  }

  const registerCredentials = {
    email: userEmail,
    password: password
  };

  const requestBody = BuildRequestBody(registerCredentials);

  const res = await sendRequest("POST", LOGIN_URL, requestBody ,null ,null);

  alert(res.data.explanation);
  if (res.status === 200) {
    alert("REFER TO ACCOUNT PAGE!");
    const { name, Authorization } = res.data.resBodyData;
    console.log("res resBodyData is");
    console.log(res.data.resBodyData.name);
    console.log(res.data.resBodyData.Authorization);
    navigate("/account", { name, Authorization });

  }

};

