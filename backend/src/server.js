 require("dotenv").config();

const express = require("express");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const { connectRabbitMQ, getChannel } = require("./services/rabbitmq");

const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const { encrypt, decrypt } = require("./security");

const app = express();
const server = http.createServer(app);
const frontendDir = path.join(__dirname, "../../frontend");

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.set("io", io);
global.io = io;
app.locals.mongoConnected = false;

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.static(frontendDir));

const demoStore = {
  users: [],
  bookings: [],
  notifications: [],
  conversations: [],
  messages: [],
  skills: [
    {
      id: "demo-skill-hci",
      title: "Human-Computer Interaction",
      description: "UI/UX, usability testing, Figma, and HCI fundamentals.",
      category: "HCI",
      availability: "Weekdays 4:00 PM - 8:00 PM",
      tutor: {
        id: "demo-tutor-hyacinth",
        username: "hyacinth@skillswap.demo",
        role: "tutor"
      }
    },
    {
      id: "demo-skill-python",
      title: "Python Programming",
      description: "Programming basics, data structures, and exam review.",
      category: "Programming",
      availability: "Weekends 9:00 AM - 3:00 PM",
      tutor: {
        id: "demo-tutor-gino",
        username: "gino@skillswap.demo",
        role: "tutor"
      }
    }
  ]
};

app.locals.demoStore = demoStore;
app.locals.searchDemoAccounts = demoSearchAccounts;

const demoTutorIdsByEmail = {
  "hyacinth@skillswap.demo": "demo-tutor-hyacinth",
  "justine@skillswap.demo": "demo-tutor-justine",
  "carlze@skillswap.demo": "demo-tutor-carlze",
  "alexander@skillswap.demo": "demo-tutor-alexander",
  "cometagino04@gmail.com": "demo-tutor-cometa-gino"
};

const demoTutorIdsByName = {
  "hyacinth bautista": "demo-tutor-hyacinth",
  "justine dian": "demo-tutor-justine",
  "carlze alberca": "demo-tutor-carlze",
  "alexander cruz": "demo-tutor-alexander",
  "gino cometa": "demo-tutor-cometa-gino",
  "cometa gino": "demo-tutor-cometa-gino"
};

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function displayNameFromUsername(username) {
  return String(username || "")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function demoSearchAccounts(query, role) {
  const term = String(query || "").trim().toLowerCase();
  const limitToRole = role === "student" || role === "tutor" ? role : null;
  const seen = new Set();
  const results = [];

  const seedAccounts = [
    ...Object.entries(demoTutorIdsByEmail).map(([username, id]) => ({
      id,
      username,
      role: "tutor"
    })),
    ...Object.entries(demoTutorIdsByName).map(([name, id]) => ({
      id,
      username: `${name.replace(/\s+/g, ".")}@skillswap.demo`,
      role: "tutor"
    })),
    ...demoStore.users.map((user) => ({
      id: user.id,
      username: user.username,
      role: user.role
    }))
  ];

  seedAccounts.forEach((account) => {
    if (limitToRole && account.role !== limitToRole) return;
    const name = displayNameFromUsername(account.username);
    const haystack = `${account.username} ${name} ${account.role}`.toLowerCase();
    if (term && !haystack.includes(term)) return;
    if (seen.has(account.username)) return;
    seen.add(account.username);
    results.push({
      id: account.id,
      username: account.username,
      role: account.role
    });
  });

  return results.slice(0, 20);
}

function demoUserId(username, role) {
  if (role === "tutor" && demoTutorIdsByEmail[username]) {
    return demoTutorIdsByEmail[username];
  }
  return `demo-user-${Date.now()}`;
}

function demoTutorIdFromBooking(body) {
  if (body.tutor) return body.tutor;

  const tutorName = String(body.tutorName || "Hyacinth Bautista").trim().toLowerCase();
  return demoTutorIdsByName[tutorName] || "demo-tutor-hyacinth";
}

function isDemoMode() {
  return app.locals.mongoConnected === false;
}

function demoOnly(req, res, next) {
  if (!isDemoMode()) return next();
  return null;
}

function signDemoUser(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "skillswapsecret",
    { expiresIn: "7d" }
  );
}

function demoAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "skillswapsecret");
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

app.post("/api/auth/register", (req, res, next) => {
  if (demoOnly(req, res, next) !== null) return;

  const username = (req.body.email || req.body.username || "").trim().toLowerCase();
  const role = req.body.role === "tutor" ? "tutor" : "student";
  if (!username || !req.body.password) {
    return res.status(400).json({ message: "Username/email and password are required" });
  }

  if (demoStore.users.some((user) => user.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = {
    id: demoUserId(username, role),
    username,
    password: req.body.password,
    role
  };

  demoStore.users.push(user);
  res.status(201).json({
    user: { id: user.id, username: user.username, role: user.role },
    token: signDemoUser(user)
  });
});

app.post("/api/auth/login", (req, res, next) => {
  if (demoOnly(req, res, next) !== null) return;

  const username = (req.body.email || req.body.username || "").trim().toLowerCase();
  let user = demoStore.users.find((item) => item.username === username);

  if (!user && username.endsWith("@skillswap.demo")) {
    const role = username.includes("tutor") || Boolean(demoTutorIdsByEmail[username]) ? "tutor" : "student";
    user = {
      id: demoUserId(username, role),
      username,
      password: req.body.password,
      role
    };
    demoStore.users.push(user);
  }

  if (!user || user.password !== req.body.password) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  res.json({
    user: { id: user.id, username: user.username, role: user.role },
    token: signDemoUser(user)
  });
});

app.get("/api/auth/search", (req, res, next) => {
  if (demoOnly(req, res, next) !== null) return;

  const query = req.query.query || req.query.q || "";
  const role = req.query.role === "tutor" || req.query.role === "student" ? req.query.role : null;
  const regex = query ? new RegExp(escapeRegex(query), "i") : null;

  const accounts = demoStore.users
    .concat(Object.entries(demoTutorIdsByEmail).map(([username, id]) => ({
      id,
      username,
      role: "tutor"
    })))
    .concat(Object.entries(demoTutorIdsByName).map(([name, id]) => ({
      id,
      username: `${name.replace(/\s+/g, ".")}@skillswap.demo`,
      role: "tutor"
    })))
    .filter((account, index, list) => {
      const key = account.username.toLowerCase();
      return list.findIndex((item) => item.username.toLowerCase() === key) === index;
    })
    .filter((account) => !role || account.role === role)
    .filter((account) => {
      if (!regex) return true;
      const name = displayNameFromUsername(account.username);
      return regex.test(account.username) || regex.test(name);
    })
    .slice(0, 20)
    .map((account) => ({
      id: account.id,
      username: account.username,
      role: account.role
    }));

  res.json(accounts);
});

app.get("/api/skills", (req, res, next) => {
  if (demoOnly(req, res, next) !== null) return;
  res.json(demoStore.skills);
});

function createDemoBooking(req, res) {
  const encryptedDetails = encrypt(req.body.details || "");
  const booking = {
    id: `demo-booking-${Date.now()}`,
    student: req.user.id,
    tutor: demoTutorIdFromBooking(req.body),
    tutorName: req.body.tutorName || "Hyacinth Bautista",
    skill: req.body.skill || "HCI tutoring session",
    encryptedDetails,
    sessionType: req.body.sessionType || "1-on-1 Session",
    sessionDate: req.body.sessionDate || "",
    sessionTime: req.body.sessionTime || "",
    meetingType: req.body.meetingType || "Online",
    paymentMethod: req.body.paymentMethod || "GCash",
    amountPaid: Number(req.body.amountPaid || 360),
    status: "pending",
    createdAt: new Date().toISOString()
  };

  demoStore.bookings.unshift(booking);
  demoStore.notifications.unshift({
    id: `demo-notification-${Date.now()}`,
    title: "New booking request",
    message: `A student requested a session for ${booking.skill}.`,
    type: "info",
    recipient: booking.tutor,
    read: false,
    createdAt: booking.createdAt
  });
  demoStore.notifications.unshift({
    id: `demo-notification-student-${Date.now()}`,
    title: "Booking request sent",
    message: `Your session request with ${booking.tutorName} for ${booking.skill} was sent.`,
    type: "success",
    recipient: booking.student,
    read: false,
    createdAt: booking.createdAt
  });

  io.to(booking.tutor).emit("new_notification", {
  title: "New booking request",
  message: `A student requested a session for ${booking.skill}.`,
  booking
});

io.to(booking.student).emit("new_notification", {
  title: "Booking request sent",
  message: `Your session request with ${booking.tutorName} was sent.`,
  booking
});

  const xmlDir = path.join(__dirname, "xml/bookings");
  if (!fs.existsSync(xmlDir)) fs.mkdirSync(xmlDir, { recursive: true });
  const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="../booking-summary.xsl"?>
<booking>
  <id>${booking.id}</id>
  <student>${booking.student}</student>
  <tutor>${booking.tutor}</tutor>
  <tutorName>${booking.tutorName}</tutorName>
  <skill>${booking.skill}</skill>
  <details>${decrypt(encryptedDetails)}</details>
  <encryptedDetails>${encryptedDetails}</encryptedDetails>
  <sessionType>${booking.sessionType}</sessionType>
  <sessionDate>${booking.sessionDate}</sessionDate>
  <sessionTime>${booking.sessionTime}</sessionTime>
  <meetingType>${booking.meetingType}</meetingType>
  <paymentMethod>${booking.paymentMethod}</paymentMethod>
  <amountPaid>${booking.amountPaid}</amountPaid>
  <status>${booking.status}</status>
  <createdAt>${booking.createdAt}</createdAt>
</booking>`;
  fs.writeFileSync(path.join(xmlDir, `${booking.id}.xml`), xmlData, "utf8");

  res.status(201).json(booking);
}

app.post("/api/bookings", demoAuth, (req, res, next) => {
  if (demoOnly(req, res, next) !== null) return;
  createDemoBooking(req, res);
});

app.post("/api/bookings/notify", demoAuth, (req, res, next) => {
  if (demoOnly(req, res, next) !== null) return;
  createDemoBooking(req, res);
});

app.get("/api/bookings", demoAuth, (req, res, next) => {
  if (demoOnly(req, res, next) !== null) return;
  res.json(demoStore.bookings.filter((booking) => (
    booking.student === req.user.id || booking.tutor === req.user.id
  )));
});

app.patch("/api/bookings/:id/status", demoAuth, (req, res, next) => {
  if (demoOnly(req, res, next) !== null) return;
  const status = req.body.status;
  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid booking status" });
  }

  const booking = demoStore.bookings.find((item) => item.id === req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (req.user.role !== "tutor" || booking.tutor !== req.user.id) {
    return res.status(403).json({ message: "Only the assigned tutor can update this booking" });
  }

  booking.status = status;
  demoStore.notifications.unshift({
    id: `demo-notification-status-${Date.now()}`,
    title: status === "accepted" ? "Booking approved" : "Booking rejected",
    message: `Your ${booking.skill} booking was ${status}.`,
    type: status === "accepted" ? "success" : "warning",
    recipient: booking.student,
    read: false,
    createdAt: new Date().toISOString()
  });

  io.to(booking.student).emit("new_notification", {
  title: booking.status === "accepted" ? "Booking approved" : "Booking rejected",
  message: `Your ${booking.skill} booking was ${booking.status}.`,
  booking
});

io.to(booking.tutor).emit("booking_status_updated", {
  id: booking.id,
  status: booking.status
});

  res.json(booking);
});

app.get("/api/notifications", demoAuth, (req, res, next) => {
  if (demoOnly(req, res, next) !== null) return;
  const isTutor = req.user.role === "tutor";
  res.json(demoStore.notifications.filter((item) => (
    item.recipient === req.user.id ||
    (isTutor && item.recipient === "demo-tutor-hyacinth") ||
    !item.recipient
  )));
});

app.post("/api/security/demo", (req, res, next) => {
  const encrypted = encrypt(req.body.text || "SkillSwap secure message");
  res.json({
    original: req.body.text || "SkillSwap secure message",
    encrypted,
    decrypted: decrypt(encrypted),
    algorithm: "AES-256-GCM"
  });
});

(async () => {
  try {
    app.locals.mongoConnected = await connectDB();
    await connectRabbitMQ();
    console.log("Startup complete");
  } catch (err) {
    console.error("Startup warning:", err.message);
  }
})();

app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api", chatRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongoConnected: Boolean(app.locals.mongoConnected),
    rabbitConnected: Boolean(getChannel())
  });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("chat_join", (conversationId, callback) => {
    if (!conversationId) return;
    socket.join(conversationId);
    if (typeof callback === "function") callback({ ok: true, conversationId });
  });

  socket.on("chat_message", (data, callback) => {
    if (typeof callback === "function") {
      callback({
        ok: false,
        message: "Send chat messages through POST /api/messages with a conversationId."
      });
    }
  });

  socket.on("typing", (data) => {
    if (data?.conversationId) {
      socket.to(data.conversationId).emit("user_typing", data);
    } else {
      socket.broadcast.emit("user_typing", data);
    }
  });

  socket.on("stop_typing", (data) => {
    if (data?.conversationId) {
      socket.to(data.conversationId).emit("user_stopped_typing", data);
    } else {
      socket.broadcast.emit("user_stopped_typing", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
