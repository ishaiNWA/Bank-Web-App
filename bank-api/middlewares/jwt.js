const jwt = require("jsonwebtoken");
const ONE_HOUR_MS = 60 * 60 * 1000;

const {
  createBlackListedToken,
  isBlackListedToken,
  findUserByEmail,
} = require("../services/db-service");

/*****************************************************************************/

function generateJWT(req, res, next) {
  const email = req.body.userEmail;
  const role = req.extractedRole;
  const jwtOptions = { expiresIn: ONE_HOUR_MS };
  const token = jwt.sign(
    { email, role },
    process.env.ACCESS_TOKEN_SECRET,
    jwtOptions
  );

  const cookieOptions = {
    expires: new Date(Date.now() + ONE_HOUR_MS),
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);

  const resBodyData = {
    name: req.name,
  };

  sendResponse(res, 200, "login success", "resBodyData", resBodyData);
}

/*****************************************************************************/

// validating a valid session for client using JWT functionalities
async function protect(req, res, next) {
  const token = extractToken(req);
  if (null == token) {
    sendResponse(res, 400, "unauthorized request");
    return;
  }
  let decodedToken = null;
  try {
    if (await isBlackListedToken(token)) {
      sendResponse(
        res,
        400,
        "You have logged out from the session. Log in again to continue."
      );
      return;
    }

    decodedToken = decodeToken(token);
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

function authorize(permitedRoles) {
  return (req, res, next) => {
    const token = extractToken(req);
    const decodedToken = decodeToken(token);
    const role = decodedToken.role;

    if (!permitedRoles.includes(role)) {
      sendResponse(
        res,
        403,
        `Only ${permitedRoles.map((role) => String(role)).join(", ")} are permitted to this operation`
      );
      return;
    }
    next();
  };
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
  if (req.cookies && req.cookies.jwt) {
    return req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const authHeader = req.headers.authorization;

    return authHeader.split("Bearer")[1].trim();
  } else {
    return null;
  }
}

/*****************************************************************************/

function sendResponse(res, resStatus, responseExplanation, dataKey, dataValue) {
  const responseBody = {
    explanation: responseExplanation,
  };
  if (dataKey) {
    responseBody[dataKey] = dataValue;
  }
  res.status(resStatus).json(responseBody);
}

/*****************************************************************************/

module.exports = { generateJWT, protect, authorize, blacklistToken };
