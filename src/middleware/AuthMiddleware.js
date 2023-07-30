const { verifyUserJWT, decryptString } = require("../services/auth_services");
const jwt = require('jsonwebtoken');


const verifyAndValidateUserJWT = async (request, response, next) => {
    try {
        let token = request.headers.authorization
        if (!token){
            throw new Error("Missing authorization headers")
        }
        let splitToken = token.split(" ")[1];

        let newToken = await verifyUserJWT(splitToken);
        
        request.splitToken = splitToken
        request.token = newToken;

        next();
    } catch (error) {
        console.log(error);
        response.status(400).json({message: "Error with validation"})
    }
    

}

const extractJwtData = async (request, response, next) => {

    try{
        let suppliedToken = request.splitToken;
        if (!suppliedToken) {
            throw new Error("Incorrect Authorization header or no header supplied");
        }

        let userJWTverified = jwt.verify(suppliedToken, process.env.JWT_SECRET, {complete: true});
        let decodedJwt = decryptString(userJWTverified.payload.data);
        let userData = JSON.parse(decodedJwt);

        request.userID = userData.userID;
        request.isAdmin = userData.isAdmin;
        request.isTrainer = userData.isTrainer;

        next();
    } catch (error) {
        console.log(error.message)
        response.status(400).json({message: "Error occurred with validation/authorization"})
    }
    
}

// Middleware to check if user is admin, to allow for admin protected routes
const checkAdminStatus = async (request, response, next) => {
    try {
        let status = request.isAdmin;
        if (status !== true) {
            throw new Error("isAdmin in request is returning false")
        }
        next ();
    } catch (error) {
        console.log(error)
        response.status(401).json({message: "Unauthorized access sorry"})
    }
}

module.exports = {
    extractJwtData,
    verifyAndValidateUserJWT,
    checkAdminStatus
}