const {User} = require("../models/UserModel");

const {validateHashedData} = require("../services/auth_services");

// Checks all user fields have been entered for sign up and updating user
const checkUserFields = (request, response, next) => {
    // Destructure Request Object into variables
    let {firstName, lastName, username, email, password} = request.body;
    
    // Conditional to ensure each variable has data
    if (!firstName || !lastName || !username || !email || !password) {
        let error = new Error("Not all fields are entered correctly");
        error.statusCode = 400;
        next(error);
    } else {
        next();
    }
}

// Checks inputted email is not being used by another account
const checkValidEmail = async (request, response, next) => {
    // Search database for user with related email from request body
    let savedUser = await User.findOne({email: request.body.email});
    // Conditional to check if a user is found within the database, return error
    if (savedUser) {
        let error = new Error("Invalid Email, please enter a valid email");
        error.statusCode = 400;
        next(error)
    } else {
        next();
    }
}

// Password Validation ensuring password length is above 8 characters
const checkPasswordLength = (request, response, next) => {
    if (request.body.password.length < 8) {
        let error = new Error("Password too short, please enter 8 characters or more");
        error.statusCode = 400;
        next(error);
    } else {
        next();
    }
}

// Checks email and password match, used for logging in
const loginMiddleware = async (request, response, next) => {
    let savedUser = await User.findOne({email: request.body.email}).exec();

    if (!savedUser) {
        let error = new Error("Invalid Email");
        error.statusCode = 400;
        next(error);
    } else {
        let validPassword = await validateHashedData(request.body.password, savedUser.password);        
        if ( !validPassword) {
            let error = new Error("Password does not match, please try again");
            error.statusCode = 400;
            next(error)
        }
        next();
    }
}


module.exports = {  
    checkUserFields,
    checkValidEmail,
    checkPasswordLength,
    loginMiddleware
};