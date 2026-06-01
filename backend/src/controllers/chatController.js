const mongoose = require("mongoose");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const User = require("../models/user");

function normalizeId(id) {
  return String(id || "");
}

function participantKeyFor(ids) {
  return ids.map(normalizeId).sort().join(":");
}

function serializeUser(user) {
  if (!user) return null;
  return {
    id: user._id || user.id,
    username: user.username,
    role: user.role
  };
}

function serializeConversation(conversation) {
  return {
    id: conversation._id || conversation.id,
    participants: (conversation.participants || []).map((participant) => (
      participant?.username ? serializeUser(participant) : { id: participant }
    )),
    lastMessage: conversation.lastMessage || null,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
}

function serializeMessage(message) {
  return {
    id: message._id || message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    text: message.text,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt
  };
}

async function getParticipantConversation(req, res, next) {
  try {
    const currentUserId = normalizeId(req.user?.id);
    const participantId = normalizeId(req.body.participantId || req.params.participantId);
    const participantUsername = String(req.body.participantUsername || "").trim().toLowerCase();

    if (!mongoose.isValidObjectId(currentUserId)) {
      return res.status(400).json({ message: "Valid current user id is required" });
    }

    const otherUser = mongoose.isValidObjectId(participantId)
      ? await User.findById(participantId).select("username role")
      : participantUsername
        ? await User.findOne({ username: participantUsername }).select("username role")
        : null;

    if (!otherUser) {
      return res.status(404).json({ message: "Participant not found" });
    }

    const otherUserId = normalizeId(otherUser._id);
    if (currentUserId === otherUserId) {
      return res.status(400).json({ message: "A conversation requires two different users" });
    }

    const participantIds = [currentUserId, otherUserId];
    const participantKey = participantKeyFor(participantIds);

    const conversation = await Conversation.findOneAndUpdate(
      { participantKey },
      {
        $setOnInsert: {
          participants: participantIds,
          participantKey
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("participants", "username role");

    res.status(200).json(serializeConversation(conversation));
  } catch (err) {
    next(err);
  }
}

async function getUserConversations(req, res, next) {
  try {
    const userId = normalizeId(req.params.userId || req.user?.id);
    if (userId !== normalizeId(req.user?.id)) {
      return res.status(403).json({ message: "You can only view your own conversations" });
    }

    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "username role")
      .sort({ updatedAt: -1 });

    res.json(conversations.map(serializeConversation));
  } catch (err) {
    next(err);
  }
}

async function getConversationMessages(req, res, next) {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 });

    res.json(messages.map(serializeMessage));
  } catch (err) {
    next(err);
  }
}

async function sendConversationMessage(req, res, next) {
  try {
    const text = String(req.body.text || "").trim();
    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const conversation = await Conversation.findOne({
      _id: req.body.conversationId || req.params.conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user.id,
      text
    });

    conversation.lastMessage = {
      text: message.text,
      senderId: message.senderId,
      createdAt: message.createdAt
    };
    await conversation.save();

    const payload = serializeMessage(message);
    req.app.get("io")?.to(String(conversation._id)).emit("chat_message", payload);

    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getParticipantConversation,
  getUserConversations,
  getConversationMessages,
  sendConversationMessage
};
