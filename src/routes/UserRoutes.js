const express = require("express");
const router = express.Router();
// Import functions from userControllers here
const {createUser, loginUser, getUser} = require("../controllers/UserController");
// Middleware Imports
const { checkUserFields, checkValidEmail, checkPasswordLength, loginMiddleware } = require("../middleware/UserMiddleware");

// Router to get all users, only admin can access this route
router.get("/all") 

// Router to get single user based from USER_ID from JWT sent in request headers
router.get("/user/:id", getUser)

// Route for user signup
router.post("/signup", checkUserFields, checkValidEmail, checkPasswordLength, createUser);


// Route for user login
router.post("/login", loginMiddleware, loginUser);

// Route for user to edit their details
// router.put("/edit-user", editUser);

module.exports = router;