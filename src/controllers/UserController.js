// Import User model, to create functionality with them
const { User } = require("../models/UserModel");
const { hashString, generateUserJWT } = require("../services/auth_services");

// ---- Regular and Trainer Controllers -----

// Function to fetch user details from database
// code takes the decoded userId from the JWT and uses that to
// find the user details of the valid user.
const getUser = async (request, response) => {
  try {
    let user = await User.findOne({ _id: request.userID }).exec();

    response.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    response.status(400).json({
      message: "Error occurred while fetching user",
    });
  }
};

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
    isTrainer: false,
    bookings: [],
  });

  // Generate JWT to send back to client for authentication in other parts of the application
  let encryptedToken = await generateUserJWT({
    userID: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    isTrainer: user.isTrainer,
  });

  await user
    .save()
    .then((user) => {
      response.json({
        message: "User saved successfully",
        token: encryptedToken,
      });
      console.log(user.email);
    })
    .catch((error) => {
      console.log(`Error occurred when saving user, error:\n` + error);
    });
};

// Function to log user in and return valid userJWT to client
const loginUser = async (request, response) => {
  try {
    let savedUser = await User.findOne({ email: request.body.email }).exec();

    let encryptedToken = await generateUserJWT({
      userID: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
      isAdmin: savedUser.isAdmin,
      isTrainer: savedUser.isTrainer,
    });

    response.status(200).json({
      message: "successful login",
      token: encryptedToken,
      trainer: savedUser.isTrainer,
      admin: savedUser.isAdmin,
    });
  } catch (error) {
    console.log(`Error occurred: \n ${error}`);
    throw error;
  }
};

// Function to allow user to update their details
const editUser = async (request, response) => {
  try {
    // If password is present in request body, hash the new password and update the request body
    if (request.body.password) {
      let hashedPassword = await hashString(request.body.password);
      request.body.password = hashedPassword;
    }

    let updatedUser = await User.findByIdAndUpdate(
      request.userID,
      request.body,
      { returnDocument: "after" }
    ).exec();

    let newToken = await generateUserJWT({
      userID: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isTrainer: updatedUser.isTrainer,
    });

    let savedUser = {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email,
    };

    response.status(200).json({ userData: savedUser, token: newToken });
  } catch (error) {
    console.log(error);
    response
      .status(400)
      .json({ message: "Error occurred, check console for further details" });
  }
};

// Delete profile from database
const deleteAccount = async (request, response) => {
  try {
    let removedUser = await User.findByIdAndDelete(request.userID).exec();
    if (!removedUser) {
      return response.status(404).json({ message: "User not found" });
    }
    response.status(200).json({ message: "Sorry to see you leave!" });
  } catch (error) {
    console.log(error);
    response
      .status(400)
      .json({ message: "Error occurred, check console for further details" });
  }
};

// ----- Admin Controllers --------

// Function for admin to see full list of users from the database
// Middleware implemented to ensure user accessing user collection is admin
const getAllUsers = async (request, response) => {
  try {
    let userList = await User.find({}).exec();
    let resultList = [];
    let userObject = {};
    for (singleUser of userList) {
        userObject = {
            firstName: singleUser.firstName,
            lastName: singleUser.lastName,
            userName: singleUser.username,
            email: singleUser.email,
            isTrainer: "" + singleUser.isTrainer
        }
        resultList.push(userObject);
    }

    response.json(resultList);
  } catch (error) {
    console.log(`Error occurred within route: \n ${error}`);
    // response.status(400).json({message: "Error occurred while fetching data"})
  }
};

const getAllTrainers = async (request, response) => {
  try {
    let trainerList = await User.find().where({ isTrainer: "true" }).exec();

    response.json(trainerList);
  } catch (error) {
    console.log(`Error occurred within route: \n ${error}`);
    // response.status(400).json({message: "Error occurred while fetching data"})
  }
};

// Function to allow Admin User to change user from being a regular user to a trainer user
// Or a trainer user to a regular user
// Function takes parameter of user and depending on the users status, changes it to the opposite.
const changeUserStatus = async (request, response) => {
  try {
    let user = await User.findOne({ username: request.params.username }).exec();
    if (!user) {
      return response
        .status(404)
        .json({ message: "User not found, check username" });
    }

    if (user.isTrainer === true) {
      user = await User.findByIdAndUpdate(
        user._id,
        { isTrainer: false },
        { returnDocument: "after" }
      ).exec();
      response.status(200).json({
        message: "Changed user status",
        isTrainer: user.isTrainer,
        token: request.token,
      });
    } else {
      user = await User.findByIdAndUpdate(
        user._id,
        { isTrainer: true },
        { returnDocument: "after" }
      ).exec();
      response.status(200).json({
        message: "Changed user status",
        isTrainer: user.isTrainer,
        token: request.token,
      });
    }
  } catch (error) {
    console.log("Error occurred: \n" + error);
    response.status(400).json({ message: "Bad request" });
  }
};

// function to allow Admin user to remove user from database
const adminDeleteUser = async (request, response) => {
  try {
    if (request.isAdmin) {
      let removedUser = await User.findOneAndDelete({
        username: request.params.username,
      }).exec();
      if (!removedUser) {
        return response
          .status(404)
          .json({ message: "User not found, check username" });
      }
      return response.status(200).json({ message: "User removed" });
    }
  } catch (error) {
    console.log("Error occurred: \n" + error);
    response.status(400).json({ message: "Bad request" });
  }
};

module.exports = {
  getUser,
  getAllTrainers,
  createUser,
  loginUser,
  getAllUsers,
  editUser,
  deleteAccount,
  changeUserStatus,
  adminDeleteUser,
};
