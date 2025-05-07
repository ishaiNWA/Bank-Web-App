
const jwt = require("jsonwebtoken");
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
const jwtOptions = { expiresIn: ONE_YEAR_IN_SECONDS };
const {SERVICE_ROLES} = require("./constants/roles");

if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }
  
  const payload = {
    sub: "FinSchedulerService",
    role: SERVICE_ROLES.FIN_SCHEDULER,
  }; 
const finSchedulerSignedToken = Object.freeze(jwt.sign(payload , process.env.ACCESS_TOKEN_SECRET ,jwtOptions ))

function getFinSchedulerSignedToken(){
    return finSchedulerSignedToken
}

module.exports = {
    getFinSchedulerSignedToken
}
