const { verifyAccessToken } = require('./jwt');

let io;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role, unitId } = socket.user;
    socket.join(`user:${id}`);
    socket.join(`role:${role}`);
    if (unitId) socket.join(`unit:${unitId}`);

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

const emitToUser = (userId, event, data) => getIO().to(`user:${userId}`).emit(event, data);
const emitToRole = (role, event, data) => getIO().to(`role:${role}`).emit(event, data);
const emitToUnit = (unitId, event, data) => getIO().to(`unit:${unitId}`).emit(event, data);
const emitToAll = (event, data) => getIO().emit(event, data);

module.exports = { initSocket, getIO, emitToUser, emitToRole, emitToUnit, emitToAll };
