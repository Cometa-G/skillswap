require("dotenv").config();

const amqp = require("amqplib");
const mongoose = require("mongoose");
const Notification = require("../models/notification");

function rabbitUrl() {
  return process.env.RABBITMQ_URL || "amqp://localhost";
}

function queueName() {
  return process.env.RABBITMQ_QUEUE || "notifications";
}

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
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Consumer connected to MongoDB");
    }

    const connection = await amqp.connect(rabbitUrl());
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName(), { durable: true });
    channel.prefetch(10);

    console.log(`RabbitMQ consumer running on queue "${queueName()}"`);

    channel.consume(queueName(), async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString());
        const notificationData = buildNotification(event);
        const saved = await Notification.create(notificationData);

        const io = global.io;
        if (io && event.recipient) {
          io.to(event.recipient).emit("new_notification", saved);
          console.log(`Notification emitted to user ${event.recipient}`);
        }

        channel.ack(msg);
      } catch (err) {
        console.error("Failed processing RabbitMQ message:", err);
        channel.nack(msg, false, true);
      }
    });
  } catch (err) {
    console.error(`Consumer error using ${rabbitUrl()}:`, err.message);
  }
}

module.exports = { startConsumer };

if (require.main === module) {
  startConsumer().catch((err) => {
    console.error("Fatal consumer crash:", err);
  });
}
