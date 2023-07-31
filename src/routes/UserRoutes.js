const express = require("express");
const router = express.Router();

// Import functions from userControllers here
const {
    createUser, loginUser, getUser, 
    getAllUsers, editUser, deleteAccount, changeUserStatus
} = require("../controllers/UserController");

// User Middleware Imports
const {
    checkUserFields, checkValidEmail, checkPasswordLength,
    loginMiddleware
} = require("../middleware/UserMiddleware");

// Auth Middleware imports
const {
    extractJwtData, verifyAndValidateUserJWT, checkAdminStatus
} = require("../middleware/AuthMiddleware")

// Router to get all users, only admin can access this route
router.get("/all", verifyAndValidateUserJWT, extractJwtData, checkAdminStatus, getAllUsers) 

// Router to get single user based from USER_ID from JWT sent in request headers
router.get("/user/", verifyAndValidateUserJWT, extractJwtData, getUser)

// Route for user signup
router.post("/signup", checkUserFields, checkValidEmail, checkPasswordLength, createUser);

// Route for user login
router.post("/login", loginMiddleware, loginUser);

// Route for user to edit their details
router.put("/edit-user", verifyAndValidateUserJWT, extractJwtData, editUser);

// Route for admin user to change userStatus
router.put("/admin/edit-status/:username", verifyAndValidateUserJWT, extractJwtData, checkAdminStatus, changeUserStatus);

// Route for user to delete their account
router.delete("/delete-account", verifyAndValidateUserJWT, extractJwtData, deleteAccount);

module.exports = router;