const express = require("express");

const { uploadFields } = require("../middleware/s3.js")
const { isAuthenticated } = require("../middleware/auth.js");

const {
  register,
  login,
  logout,
  getUser,
  getAllUser,
  updateProfile, 
  updatePassword,
  forgotPassword,
  resetPassword, 
  getUserForPortfolio
} = require("../controller/userController.js");



const router = express.Router();

router.post("/register", uploadFields, register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.get("/alluser", isAuthenticated, getAllUser);
router.put("/me/update", isAuthenticated, uploadFields, updateProfile);
router.put("/me/updatepassword", isAuthenticated, uploadFields, updatePassword);
router.post("/password/forgot", forgotPassword);
router.post("/password/reset/:token", resetPassword);
router.get("/portfolio/me", getUserForPortfolio);


module.exports = router;
