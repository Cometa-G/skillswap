const fs = require("fs");
const path = require("path");

const Booking = require("../models/booking");
const Notification = require("../models/notification");
const User = require("../models/user");
const { sendToQueue } = require("../services/rabbitmq");
const { encrypt, decrypt } = require("../security");
const bcrypt = require("bcryptjs");

const knownTutorAccounts = {
  "hyacinth bautista": "hyacinth@skillswap.demo",
  "justine dian": "justine@skillswap.demo",
  "carlze alberca": "carlze@skillswap.demo",
  "carlze": "carlze@skillswap.demo",
  "alexander cruz": "alexander@skillswap.demo",
  "gino cometa": "cometagino04@gmail.com",
  "cometa gino": "cometagino04@gmail.com"
};

async function resolveTutorId(body) {
  if (body.tutor) return body.tutor;

  const tutorName = String(body.tutorName || "Hyacinth Bautista").trim().toLowerCase();
  const username = knownTutorAccounts[tutorName] || "hyacinth@skillswap.demo";

  let tutor = await User.findOne({ username });
  if (!tutor) {
    tutor = await User.create({
      username,
      password: await bcrypt.hash("demo-only", 10),
      role: "tutor"
    });
  }

  return tutor._id;
}

exports.createBooking = async (req, res) => {
  try {
    const tutorId = await resolveTutorId(req.body);

    const booking = await Booking.create({
      student: req.user.id,
      tutor: tutorId,
      tutorName: req.body.tutorName || "Hyacinth Bautista",
      skill: req.body.skill || "General tutoring",
      encryptedDetails: encrypt(req.body.details || ""),
      sessionType: req.body.sessionType || "1-on-1 Session",
      sessionDate: req.body.sessionDate || "",
      sessionTime: req.body.sessionTime || "",
      meetingType: req.body.meetingType || "Online",
      paymentMethod: req.body.paymentMethod || "GCash",
      amountPaid: Number(req.body.amountPaid || 360),
      status: "pending"
    });

    const event = {
      type: "NEW_BOOKING",
      payload: {
        tutor: booking.tutor.toString(),
        student: booking.student.toString(),
        skill: booking.skill
      },
      recipient: booking.tutor.toString()
    };

    const queued = sendToQueue("notifications", event);
    if (!queued) {
      await Notification.create({
        title: "New booking request",
        message: `A student requested a session for ${booking.skill}.`,
        type: "info",
        recipient: booking.tutor
      });
    }

    await Notification.create({
      title: "Booking request sent",
      message: `Your session request with ${booking.tutorName} for ${booking.skill} was sent.`,
      type: "success",
      recipient: booking.student
    });

    const io = req.app.get("io");
    if (io) {
      io.to(booking.tutor.toString()).emit("new_notification", {
        title: "New booking request",
        message: `A student requested a session for ${booking.skill}.`
      });
      io.to(booking.student.toString()).emit("new_notification", {
        title: "Booking request sent",
        message: `Your session request with ${booking.tutorName} was saved.`
      });
      io.emit("new_booking", {
        tutor: booking.tutor,
        student: booking.student,
        skill: booking.skill,
        status: booking.status
      });
    }

    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="../booking-summary.xsl"?>
<booking>
  <id>${booking._id}</id>
  <student>${booking.student}</student>
  <tutor>${booking.tutor}</tutor>
  <tutorName>${booking.tutorName}</tutorName>
  <skill>${booking.skill}</skill>
  <details>${decrypt(booking.encryptedDetails)}</details>
  <encryptedDetails>${booking.encryptedDetails}</encryptedDetails>
  <sessionType>${booking.sessionType}</sessionType>
  <sessionDate>${booking.sessionDate}</sessionDate>
  <sessionTime>${booking.sessionTime}</sessionTime>
  <meetingType>${booking.meetingType}</meetingType>
  <paymentMethod>${booking.paymentMethod}</paymentMethod>
  <amountPaid>${booking.amountPaid}</amountPaid>
  <status>${booking.status}</status>
  <createdAt>${booking.createdAt}</createdAt>
</booking>`.trim();

    const xmlDir = path.join(__dirname, "../xml/bookings");
    if (!fs.existsSync(xmlDir)) fs.mkdirSync(xmlDir, { recursive: true });

    const xmlFile = path.join(xmlDir, `booking_${booking._id}.xml`);
    fs.writeFileSync(xmlFile, xmlData, "utf8");

    res.status(201).json(booking);
  } catch (err) {
    console.error("Create Booking Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "student") filter.student = req.user.id;
    if (req.user.role === "tutor") filter.tutor = req.user.id;

    const bookings = await Booking.find(filter)
      .populate("student", "username role")
      .populate("tutor", "username role")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Get Bookings Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    if (req.user.role !== "tutor") {
      return res.status(403).json({ message: "Only tutors can update booking status" });
    }

    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, tutor: req.user.id },
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await Notification.create({
      title: status === "accepted" ? "Booking approved" : "Booking rejected",
      message: `Your ${booking.skill} booking was ${status}.`,
      type: status === "accepted" ? "success" : "warning",
      recipient: booking.student
    });

    const io = req.app.get("io");
    if (io) {
      io.to(booking.student.toString()).emit("new_notification", {
        title: status === "accepted" ? "Booking approved" : "Booking rejected",
        message: `Your ${booking.skill} booking was ${status}.`
      });
      io.emit("booking_status_updated", {
        id: booking._id,
        status: booking.status
      });
    }

    res.json(booking);
  } catch (err) {
    console.error("Update Booking Error:", err);
    res.status(500).json({ message: err.message });
  }
};
