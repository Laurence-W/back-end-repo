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
        

        request.token = newToken;

        next();
    } catch (error) {
        console.log(error);
        response.status(400).json({message: "Error with validation"})
    }
    

}

const extractUserId = async (request, response, next) => {

    try{
        let suppliedToken = request.headers.authorization;
        if (!suppliedToken) {
            throw new Error("Incorrect Authorization header or no header supplied");
        }

        let token = suppliedToken.split(" ")[1];
        let userJWTverified = jwt.verify(token, process.env.JWT_SECRET, {complete: true});
        let decodedJwt = decryptString(userJWTverified.payload.data);
        let userData = JSON.parse(decodedJwt);

        request.userID = userData.userID;

        next();
    } catch (error) {
        console.log(error.message)
        response.status(400).json({message: "Error occurred with validation/authorization"})
    }
    

    

}


module.exports = {
    extractUserId,
    verifyAndValidateUserJWT
}