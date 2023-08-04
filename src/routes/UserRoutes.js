const express = require("express");
const router = express.Router();

// Import functions from userControllers here
const {
  createUser,
  loginUser,
  getUser,
  getAllUsers,
  getAllTrainers,
  editUser,
  deleteAccount,
  changeUserStatus,
  adminDeleteUser,
} = require("../controllers/UserController");

// User Middleware Imports
const {
    checkUserFields, checkValidEmail, 
    checkPasswordLength,
    loginMiddleware,
    updatePasswordCheck
} = require("../middleware/UserMiddleware");

// Auth Middleware imports
const {
  extractJwtData,
  verifyAndValidateUserJWT,
  checkAdminStatus,
} = require("../middleware/AuthMiddleware");
const { handleErrors } = require("../middleware/ErrorHandler");

// Router to get all users, only admin can access this route
router.get(
  "/all",
  verifyAndValidateUserJWT,
  extractJwtData,
  checkAdminStatus,
  handleErrors,
  getAllUsers
);

// Router to get all users, only admin can access this route
router.get("/allTrainers", handleErrors, getAllTrainers);

// Router to get single user based from USER_ID from JWT sent in request headers
router.get(
  "/user/",
  verifyAndValidateUserJWT,
  extractJwtData,
  handleErrors,
  getUser
);

// Route for user signup
router.post(
  "/signup",
  checkUserFields,
  checkValidEmail,
  checkPasswordLength,
  handleErrors,
  createUser
);

// Route for user login
router.post("/login", loginMiddleware, handleErrors, loginUser);

// Route for user to edit their details
router.put("/edit-user", 
  verifyAndValidateUserJWT, 
  extractJwtData, 
  updatePasswordCheck,
  handleErrors, 
  editUser);


// Route for admin user to change userStatus
router.put(
  "/admin/edit-status/:username",
  verifyAndValidateUserJWT,
  extractJwtData,
  checkAdminStatus,
  handleErrors,
  changeUserStatus
);

// Route for user to delete their account
router.delete(
  "/delete-account",
  verifyAndValidateUserJWT,
  extractJwtData,
  handleErrors,
  deleteAccount
);

// Route for removal of user via Admin
router.delete(
  "/admin/remove-account/:username",
  verifyAndValidateUserJWT,
  extractJwtData,
  checkAdminStatus,
  handleErrors,
  adminDeleteUser
);

module.exports = router;
