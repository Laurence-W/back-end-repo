// Import User model, to create functionality with them
const {User} = require("../models/UserModel");
const { hashString, generateUserJWT } = require("../services/auth_services");

// Function to fetch user details from database
// code takes the decoded userId from the JWT and uses that to 
// find the user details of the valid user.
const getUser = async (request, response) => {
    try {
        let user = await User.findOne({_id: request.userID}).exec();

        response.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email
        })
    } catch(error) {
        console.log(error)
        response.status(400).json({
            message: "Error occurred while fetching user"
        })
    }
    
}

// Function for admin to see full list of users from the database
// Middleware implemented to ensure user accessing user collection is admin
const getAllUsers = async (request, response) => {
    try {
        let userList = await User.find({}).exec();

        response.json(userList);
    } catch (error) {
        console.log(`Error occurred within route: \n ${error}`)
        response.status(400).json({message: "Error occurred while fetching data"})
    }
    
}


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
        email: user.email,
        isAdmin: user.isAdmin,
        isTrainer: user.isTrainer
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
        let savedUser = await User.findOne({email: request.body.email}).exec()

        let encryptedToken = await generateUserJWT({
            userID: savedUser.id,
            username: savedUser.username,
            email: savedUser.email,
            isAdmin: savedUser.isAdmin,
            isTrainer: savedUser.isTrainer 
        })

        response.json({message: "successful login", token: encryptedToken})
    } catch (error) {
        console.log(`Error occured: \n ${error}`);
    }
}


// Function to allow user to update their details
const editUser = async (request, response) => {
    try{

        if(request.body.password) {
            let hashedPassword = await hashString(request.body.password);
            request.body.password = hashedPassword;
        }


        let updatedUser = await User.findByIdAndUpdate(request.userID, request.body, {returnDocument: "after"}).exec();

        let newToken = await generateUserJWT({
            userID: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isTrainer: updatedUser.isTrainer
        })

        let savedUser = {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            username: updatedUser.username,
            email: updatedUser.email
        }

        response.status(200).json({userData: savedUser, token: newToken});
    } catch (error) {
        console.log(error);
        response.status(400).json({message: "Error occurred, check console for further details"})
    }
        
}


module.exports = {
        getUser, createUser, loginUser,
        getAllUsers, editUser
    };