const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUser,
  updateProfile,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/Auth");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getUser);
router.put("/update", protect, updateProfile);
router.post("/logout", protect, logout);

module.exports = router;
