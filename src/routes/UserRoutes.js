const express = require("express");
const router = express.Router();
// Import functions from userControllers here
const {createUser} = require("../controllers/UserController");
// Middleware Imports
const { checkUserFields, checkValidEmail, checkPasswordLength } = require("../middleware/UserMiddleware");

// Route for user signup
router.post("/signup", checkUserFields, checkValidEmail, checkPasswordLength, createUser);


// Route for user login
router.post("/login", loginUser);

module.exports = router;