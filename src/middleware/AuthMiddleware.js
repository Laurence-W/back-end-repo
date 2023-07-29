const { verifyUserJWT, decryptString } = require("../services/auth_services");
const jwt = require('jsonwebtoken');


const verifyAndValidateUserJWT = async (request, response, next) => {

    let newToken = verifyUserJWT(request.headers.jwt);

    request.token = newToken;

    next();

}

const destructureToken = async (request, response, next) => {

    let suppliedToken = request.headers.authorization;
    let token = suppliedToken.split(" ")[1];
    let userJWTverified = jwt.verify(token, process.env.JWT_SECRET, {complete: true});
    let decodedJwt = decryptString(userJWTverified.payload.data);
    let userData = JSON.parse(decodedJwt);

    console.log(userData)

    request.userID = userData.userID;

    next();

}


module.exports = {
    destructureToken,
    verifyAndValidateUserJWT
}