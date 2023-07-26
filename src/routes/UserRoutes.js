const express = require("express");
const router = express.Router();
// Import functions from userControllers here
const {createUser, loginUser} = require("../controllers/UserController");
// Middleware Imports
const { checkUserFields, checkValidEmail, checkPasswordLength, loginMiddleware } = require("../middleware/UserMiddleware");

// Route for user signup
router.post("/signup", checkUserFields, checkValidEmail, checkPasswordLength, createUser);


// Route for user login
router.post("/login", loginMiddleware, loginUser);

module.exports = router;