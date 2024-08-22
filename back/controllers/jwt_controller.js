const jwt = require("jsonwebtoken");

const {
  createBlackListedToken,
  isBlackListedToken,
  findUserByEmail,
} = require("../database/DB_operations");

/*****************************************************************************/

function generateJWT(req, res, next) {
  const email = { email: req.body.userEmail };
  const options = { expiresIn: "1h" };
  const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, options);

  const resBodyData = {
    name: req.name,
    Authorization: `Bearer${token}`,
  };

  sendResponse(res, 200, "login success", "resBodyData", resBodyData);
}

/*****************************************************************************/

async function verifyJWT(req, res, next) {
  const token = extractToken(req);
  if (null == token) {
    sendResponse(res, 400, "unauthorized request");
    return;
  }

  try {
    if (await isBlackListedToken(token)) {
      sendResponse(
        res,
        400,
        "You have logged out from the session. Log in again to continue.",
      );
      return;
    }

    var decodedToken = decodeToken(token);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      sendResponse(res, 401, error.message);
    } else {
      sendResponse(res, 400, error);
    }
    return;
  }

  const userEmail = decodedToken.email;

  if (!(await findUserByEmail(userEmail))) {
    sendResponse(res, 400, "user was not found");
    return;
  } else {
    req.userEmail = userEmail;

    next();
  }
}

/*****************************************************************************/

async function blacklistToken(req, res, next) {
  const token = extractToken(req);
  if (null == token) {
    sendResponse(res, 400, "unauthorized request");
    return;
  }
  try {
    await createBlackListedToken(token);
  } catch (error) {
    console.log(error);
    sendResponse(res, 400, error);
    return;
  }

  sendResponse(res, 200, "logout complete", null, null);
}

/*****************************************************************************/

function decodeToken(token) {
  const options = { expiresIn: "1h" };
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, options);
}

/*****************************************************************************/

function extractToken(req) {
  const bearerHeader = req.headers["authorization"];
  if (null == bearerHeader) {
    return null;
  } else {
    return bearerHeader.split("Bearer")[1];
  }
}

/*****************************************************************************/

function sendResponse(res, resStatus, responseExplanation, dataKey, dataValue) {
  let responseBody = {
    explanation: responseExplanation,
  };
  if (dataKey) {
    responseBody[dataKey] = dataValue;
  }
  res.status(resStatus).json(responseBody);
}

/*****************************************************************************/

module.exports = { generateJWT, verifyJWT, blacklistToken };
