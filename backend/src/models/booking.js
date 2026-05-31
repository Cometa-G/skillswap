const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  tutorName: {
    type: String,
    default: "Hyacinth Bautista"
  },

  skill: {
    type: String,
    required: true
  },

  encryptedDetails: {
    type: String,
    default: ""
  },

  sessionType: {
    type: String,
    default: "1-on-1 Session"
  },

  sessionDate: {
    type: String,
    default: ""
  },

  sessionTime: {
    type: String,
    default: ""
  },

  meetingType: {
    type: String,
    default: "Online"
  },

  paymentMethod: {
    type: String,
    default: "GCash"
  },

  amountPaid: {
    type: Number,
    default: 360
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

module.exports =
  mongoose.model("Booking", bookingSchema);
