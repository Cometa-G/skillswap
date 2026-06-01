const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  participantKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  lastMessage: {
    text: { type: String, default: "" },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date }
  }
}, { timestamps: true });

conversationSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
