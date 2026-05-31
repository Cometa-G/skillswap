require("dotenv").config(); // load .env variables
console.log("🚀 Consumer file started");

const amqp = require("amqplib");
const mongoose = require("mongoose");
const Notification = require("../models/notification");

function buildNotification(event) {
  const { type, payload, recipient } = event;

  switch (type) {
    case "NEW_BOOKING":
      return {
        title: "New Booking Request",
        message: `Student ${payload.student} requested ${payload.skill}`,
        type: "info",
        recipient,
        read: false
      };

    default:
      return {
        title: "System Notification",
        message: "You have a new update",
        type: "info",
        recipient,
        read: false
      };
  }
}

async function startConsumer() {
  try {
    // ======================
    // 1. MongoDB connection
    // ======================
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("🟢 Consumer connected to MongoDB");
    }

    // ======================
    // 2. RabbitMQ connection
    // ======================
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue("notifications");
    channel.prefetch(10);

    console.log("📥 RabbitMQ Consumer running...");

    // ======================
    // 3. Consume messages
    // ======================
    channel.consume("notifications", async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString());
        console.log("📩 Event received:", event);

        // 4. Build notification
        const notificationData = buildNotification(event);

        // 5. Save to MongoDB
        const saved = await Notification.create(notificationData);

        console.log("💾 Notification saved:", saved);

        // ======================
        // 6. REAL-TIME EMIT 🔥
        // ======================
        // Replace global emit with user-specific emit
const io = global.io;
if (io && event.recipient) {
  io.to(event.recipient).emit("new_notification", saved);
  console.log(`📡 Notification emitted to user ${event.recipient}`);
}

      } catch (err) {
        console.error("❌ Failed processing message:", err);
      }
    });

  } catch (err) {
    console.error("Consumer error:", err);
  }
}

module.exports = { startConsumer };

startConsumer().catch(err => {
  console.error("❌ Fatal consumer crash:", err);
});
