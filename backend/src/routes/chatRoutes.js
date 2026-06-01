const express = require("express");
const auth = require("../middleware/authMiddleware");
const {
  getParticipantConversation,
  getUserConversations,
  getConversationMessages,
  sendConversationMessage
} = require("../controllers/chatController");

const router = express.Router();

router.post("/conversations", auth, getParticipantConversation);
router.get("/conversations", auth, getUserConversations);
router.get("/users/:userId/conversations", auth, getUserConversations);
router.get("/conversations/:conversationId/messages", auth, getConversationMessages);
router.post("/messages", auth, sendConversationMessage);
router.post("/conversations/:conversationId/messages", auth, sendConversationMessage);

router.use((err, req, res, next) => {
  if (err?.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }
  res.status(500).json({ message: err.message || "Chat request failed" });
});

module.exports = router;
