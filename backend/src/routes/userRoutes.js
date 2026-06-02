const express = require("express");
const auth = require("../middleware/authMiddleware");
const { searchUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/", auth, searchUsers);
router.get("/search", auth, searchUsers);

module.exports = router;
