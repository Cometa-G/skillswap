const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  category: String,
  availability: String
}, { timestamps: true });

module.exports =
  mongoose.model("Skill", skillSchema);