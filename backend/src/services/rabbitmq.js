const amqp = require("amqplib");

let channel;
let connection;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();

    await channel.assertQueue("notifications");

    console.log("RabbitMQ Connected");
    return channel;
  } catch (err) {
    console.warn("RabbitMQ unavailable. Notifications will be saved directly.");
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
    queue,
    Buffer.from(JSON.stringify(data))
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
