// Import User model, to create functionality with them
const {User} = require("../models/UserModel");
const { hashString, generateUserJWT } = require("../services/auth_services");





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
        let savedUser = await User.findOne({email: request.body.email})

        let encryptedToken = await generateUserJWT({
            userID: savedUser.id,
            username: savedUser.username,
            email: savedUser.email 
        })

        response.json({message: "successful login", token: encryptedToken})
    } catch (error) {
        response.status(400).json({message: `Something has gone wrong ${error}`})
    }
}



module.exports = {createUser, loginUser};