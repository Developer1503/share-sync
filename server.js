const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Socket.io with CORS configuration for production
const io = socketIO(server, {
  cors: {
    origin: "*", // Allow all origins (you can restrict this to your domain)
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'], // Support both for reliability
  pingTimeout: 60000,
  pingInterval: 25000
});

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for rooms
const rooms = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle room joining
  socket.on('join-room', (roomCode) => {
    // Leave any previous rooms
    const previousRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
    previousRooms.forEach(room => {
      socket.leave(room);
      updateRoomUsers(room);
    });

    // Join the new room
    socket.join(roomCode);

    // Track room users
    if (!rooms.has(roomCode)) {
      rooms.set(roomCode, new Set());
    }
    rooms.get(roomCode).add(socket.id);

    console.log(`Client ${socket.id} joined room: ${roomCode}`);

    // Notify client of successful join
    socket.emit('room-joined', roomCode);

    // Notify room of user count update
    updateRoomUsers(roomCode);
  });

  // Handle leaving a room
  socket.on('leave-room', (roomCode) => {
    console.log(`Client ${socket.id} leaving room: ${roomCode}`);

    // Leave the socket.io room
    socket.leave(roomCode);

    // Remove user from room tracking
    if (rooms.has(roomCode)) {
      const users = rooms.get(roomCode);
      users.delete(socket.id);

      // Clean up empty rooms
      if (users.size === 0) {
        rooms.delete(roomCode);
        console.log(`Room ${roomCode} is empty and has been deleted`);
      } else {
        // Update remaining users in the room
        updateRoomUsers(roomCode);
      }
    }
  });

  // Handle message sending
  socket.on('send-message', ({ roomCode, message, timestamp }) => {
    console.log(`Message in room ${roomCode}:`, message);

    // Broadcast message to everyone in the room including sender
    io.to(roomCode).emit('receive-message', {
      message,
      timestamp,
      socketId: socket.id
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Remove user from all rooms and clean up empty rooms
    rooms.forEach((users, roomCode) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);

        if (users.size === 0) {
          rooms.delete(roomCode);
          console.log(`Room ${roomCode} is empty and has been deleted`);
        } else {
          updateRoomUsers(roomCode);
        }
      }
    });
  });
});

// Helper function to update room user count
function updateRoomUsers(roomCode) {
  const users = rooms.get(roomCode);
  if (users) {
    io.to(roomCode).emit('room-users-update', users.size);
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
});
