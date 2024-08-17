const jwt = require("jsonwebtoken");
const User = require("../model/User");
const BlackListedToken = require("../model/BlackListedToken");

/*****************************************************************************/

async function generateJWT(req, res, next) {
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
    const result = await isBlackListedToken(token);
    if (result) {
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
  const isExistedUser = await findUser(userEmail, req);

  if (!isExistedUser) {
    sendResponse(res, 400, "user was not found");
    return;
  } else {
    req.userEmail = userEmail;
    //  req.mongoose = mongoose.connection;
    next();
  }
}

/*****************************************************************************/

async function findUser(userEmail, req) {
  user = await User.findOne({ email: userEmail });

  if (!user) {
    return false;
  } else {
    return true;
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
    await BlackListedToken.create({
      token: token,
    });
  } catch (error) {
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
  const bearerHeader = req.headers["authorization"]; //*maybe should be "Authorization" !!!
  if (null == bearerHeader) {
    return null;
  } else {
    return bearerHeader.split("Bearer")[1];
  }
}

/*****************************************************************************/

async function isBlackListedToken(token) {
  return await BlackListedToken.findOne({ token: token });
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
