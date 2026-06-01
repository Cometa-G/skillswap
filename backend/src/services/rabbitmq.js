const amqp = require("amqplib");

let channel;
let connection;

function rabbitUrl() {
  return process.env.RABBITMQ_URL || "amqp://localhost";
}

function queueName(name) {
  return name || process.env.RABBITMQ_QUEUE || "notifications";
}

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(rabbitUrl());
    channel = await connection.createChannel();

    await channel.assertQueue(queueName(), { durable: true });

    console.log("RabbitMQ Connected");
    return channel;
  } catch (err) {
    console.warn(`RabbitMQ unavailable at ${rabbitUrl()}. Notifications will be saved directly.`);
    return null;
  }
}

function getChannel() {
  return channel;
}

function sendToQueue(queue, data) {
  if (!channel) {
    return false;
  }

  channel.sendToQueue(
    queueName(queue),
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );

  return true;
}

async function closeRabbitMQ() {
  if (channel) await channel.close();
  if (connection) await connection.close();
}

module.exports = {
  closeRabbitMQ,
  connectRabbitMQ,
  getChannel,
  sendToQueue
};
