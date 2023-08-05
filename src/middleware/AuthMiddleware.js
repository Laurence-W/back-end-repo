const { verifyUserJWT, decryptString } = require("../services/auth_services");
const jwt = require("jsonwebtoken");

// Verifies supplied user JWT and returns new token for client use
// Error catches if no token is sent, handled through error handlers
// Splits token to send through to next step in middleware functions if needed for use
const verifyAndValidateUserJWT = async (request, response, next) => {
  let token = request.headers.authorization;
  if (!token) {
    let error = new Error("No Authorization headers sent");
    error.statusCode = 400;
    next(error);
  } else {
    let splitToken = token.split(" ")[1];

    let newToken = await verifyUserJWT(splitToken);

    request.splitToken = splitToken;
    request.token = newToken;

    next();
  }
};

// Takes split token from request, and extracts JWT data
// Giving controllers access to userID, admin and trainer status
// Extra precaution for error handling to confirm split token is supplied
const extractJwtData = async (request, response, next) => {
  let suppliedToken = request.splitToken;
  if (!suppliedToken) {
    let error = new Error("Error within split token");
    error.statusCode = 500;
    next(error);
  } else {
    let userJWTverified = jwt.verify(suppliedToken, process.env.JWT_SECRET, {
      complete: true,
    });
    let decodedJwt = decryptString(userJWTverified.payload.data);
    let userData = JSON.parse(decodedJwt);

    request.userID = userData.userID;
    request.isAdmin = userData.isAdmin;
    request.isTrainer = userData.isTrainer;

    next();
  }
};

// Middleware to check if user is admin, to allow for admin protected routes
const checkAdminStatus = async (request, response, next) => {
  let status = request.isAdmin;
  if (status !== true) {
    let error = new Error("Unauthorized access");
    error.statusCode = 401;
    next(error);
  } else {
    next();
  }
};

const checkAdminOrTrainerStatus = async (request, response, next) => {
  let adminStatus = request.isAdmin;
  let trainerStatus = request.isTrainer;
  if (adminStatus !== true && trainerStatus !== true) {
    let error = new Error("Unauthorized access");
    error.statusCode = 401;
    next(error);
  } else {
    next();
  }
};

module.exports = {
  extractJwtData,
  verifyAndValidateUserJWT,
  checkAdminStatus,
  checkAdminOrTrainerStatus,
};
