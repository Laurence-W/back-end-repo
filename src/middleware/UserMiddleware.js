const {User} = require("../models/UserModel");

const {validateHashedData} = require("../services/auth_services");

// Checks all user fields have been entered for sign up and updating user
const checkUserFields = (request, response, next) => {
    // Destructure Request Object into variables
    let {firstName, lastName, username, email, password} = request.body;
    
    // Conditional to ensure each variable has data
    if (!firstName || !lastName || !username || !email || !password) {
        return response.status(400).json({message: "Please enter in all fields"});
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
        return response.status(422).json({message: "User already exists with email"});
    } else {
        next();
    }
}

// Password Validation ensuring password length is above 8 characters
const checkPasswordLength = (request, response, next) => {
    if (request.body.password.length < 8) {
        return response.status(400).json({message: "Password length is too short, enter 8 or more characters"});
    } else {
        next();
    }
}

// Checks email and password match, used for logging in
const loginMiddleware = async (request, response, next) => {
    try {
        let savedUser = await User.findOne({email: request.body.email});

        if (!savedUser) {
            return response.status(400).json({message: "Email does not exist, please try again"})
        }

        let validPassword = await validateHashedData(request.body.password, savedUser.password);        
        if ( !validPassword) {
            return response.status(400).json({message: "Passwords do not match, try again"});
        }

        next();
    } catch (error) {
        return response.status(400).json({message: `Some Error occurred: ${error}`})
    }
}

module.exports = {  
    checkUserFields,
    checkValidEmail,
    checkPasswordLength,
    loginMiddleware
};