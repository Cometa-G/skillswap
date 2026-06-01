const express = require("express");
const router = express.Router();

const {
  register,
  login,
  searchUsers
} = require("../controllers/authController");

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// SEARCH ACCOUNTS
router.get("/search", searchUsers);

module.exports = router;
