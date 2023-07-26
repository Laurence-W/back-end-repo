// Import User model, to create functionality with them
const {User} = require("../models/UserModel");
const { hashString, generateUserJWT, validateHashedData } = require("../services/auth_services");





// Sign up function 
const createUser = async (request, response) => {

    // Hash and salt password
    let hashedPassword = await hashString(request.body.password);

    let user = new User({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        username: request.body.username,
        email: request.body.email,
        password: hashedPassword,
        isAdmin: false,
        isTrainer: false
    })

    // Generate JWT to send back to client for authentication in other parts of the application
    let encryptedToken = await generateUserJWT({
        userID: user.id,
        username: user.username,
        email: user.email
    });

    await user.save().then((user) => {
        response.json({message: "User saved successfully", token: encryptedToken});
        console.log(user.email);
    }).catch((error) => {
        console.log(`Error occurred when saving user, error:\n` + error);
    })
}

// Function to log user in and return valid userJWT to client
const loginUser = async (request, response) => {
    try {
        let savedUser = User.findOne({email: request.body.email})
        if (!savedUser) {
            response.status(400).json({message: "Email does not exist, please try again"})
        }

        let validPassword = await validateHashedData(request.body.password, savedUser.password);        
        if ( !validPassword) {
            response.status(400).json({message: "Emails do not match, try again"});
        }

        let encryptedToken = await generateUserJWT({
            userID: savedUser.id,
            username: savedUser.username,
            email: savedUser.email 
        })

        response.json({message: "successful login", token: encryptedToken})
    } catch (error) {
        
    }
}



module.exports = {createUser};