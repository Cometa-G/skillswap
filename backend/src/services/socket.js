let io;

function initSocket(serverIo) {
  io = serverIo;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}

module.exports = { initSocket, getIO };