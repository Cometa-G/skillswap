const express = require("express");
const router = express.Router();

const {
  register,
  login,
  searchUsers,
  googleStart,
  googleCallback
} = require("../controllers/authController");

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// SEARCH ACCOUNTS
router.get("/search", searchUsers);

// GOOGLE OAUTH
router.get("/google", googleStart);
router.get("/google/callback", googleCallback);

module.exports = router;
