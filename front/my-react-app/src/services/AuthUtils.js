// API utilities
import {
  sendRequest,
  REGISTER_URL,
  REGISTER_CONFIRMATION_URL,
  LOGIN_URL,
} from "./ApiUtils";

// Input validation utilities
import {
  isValidName,
  isValidPassword,
  isMatchingPasswords,
  isValidEmailAddress,
} from "./inputValidationUtils";

// Constants
const INVALID_PASSWORD_MSG = `
Your password must meet the following criteria:
1. At least 5 characters long
2. No more than 20 characters long
3. At least one uppercase letter (A-Z)
4. At least one lowercase letter (a-z)
5. At least one digit (0-9)
6. At least one special character (!@#$%^&*)
`;

/*****************************************************************************/

export const registerHandler = async (registerDataObj) => {
  const { method, registerCredentials, setOpenModel } = registerDataObj;
  try {
    verifyValidRegisterCredentials(registerCredentials);
  } catch (error) {
    alert(error.message);
    return;
  }
  const requestBody = buildRequestBody(registerCredentials);
  const res = await sendRequest(method, REGISTER_URL, requestBody, null, null);

  alert(res.data.explanation);
  if (res.status === 200) {
    setOpenModel(true);
  }
};

/*****************************************************************************/

const buildRequestBody = (registerCredentials) => {
  return {
    name: null != registerCredentials.name ? registerCredentials.name : null,
    userEmail: registerCredentials.email,
    password: registerCredentials.password,
  };
};

/*****************************************************************************/

const verifyValidRegisterCredentials = (registerCredentials) => {
  if (!isValidName(registerCredentials.name)) {
    throw new Error("name should be 1-20 only upper/lower case letters");
  }

  if (!isValidEmailAddress(registerCredentials.email)) {
    throw new Error("invalid email address");
  }

  if (!isValidPassword(registerCredentials.password)) {
    throw new Error(INVALID_PASSWORD_MSG);
  }

  if (
    !isMatchingPasswords(
      registerCredentials.password,
      registerCredentials.passwordConfirmation
    )
  ) {
    throw new Error("confirm your password again");
  }
};

/*****************************************************************************/

export const confirmationHandler = async (confirmationHandlerDataObj) => {
  const { method, confirmationPassword, registerEmail, password, navigate } =
    confirmationHandlerDataObj;

  const requestBody = {
    confirmationPassword,
  };

  const res = await sendRequest(
    method,
    REGISTER_CONFIRMATION_URL,
    requestBody,
    null,
    null
  );

  if (res.status === 200) {
    await loginHandler({ userEmail: registerEmail, password, navigate });
  }
};

/*****************************************************************************/

export const loginHandler = async (loginDataObj) => {
  const { userEmail, password, navigate } = loginDataObj;

  if (!isValidEmailAddress(userEmail)) {
    alert("invalid email address");
    return;
  }
  if (!isValidPassword(password)) {
    alert(INVALID_PASSWORD_MSG);
    return;
  }

  const registerCredentials = {
    email: userEmail,
    password: password,
  };

  const requestBody = buildRequestBody(registerCredentials);

  const res = await sendRequest("POST", LOGIN_URL, requestBody, null, null);

  alert(res.data.explanation);
  if (res.status === 200) {
    const { name, Authorization } = res.data.resBodyData;
    navigate("/account", { state: { name: name, jwt: Authorization } }); // pass data to another rout as a state
  }
};
