const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  createBooking,
  getBookings,
  updateBookingStatus
} = require("../controllers/bookingController");

router.get("/", auth, getBookings);
router.patch("/:id/status", auth, updateBookingStatus);
router.post("/notify", auth, createBooking);
router.post("/", auth, createBooking);

module.exports = router;
