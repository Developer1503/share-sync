const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const multer = require('multer');

// Configure multer for memory storage and up to 100MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

const app = express();
const server = http.createServer(app);

// Socket.io with CORS configuration for production
const io = socketIO(server, {
  cors: {
    origin: "*", // Allow requests from any origin (restrict to your frontend domain in production)
    methods: ["GET", "POST"],
    credentials: true
  },
  // WebSocket-first for persistent server deployment
  transports: ['websocket', 'polling'],
  // Standard timeouts (works great on persistent servers)
  pingTimeout: 60000,
  pingInterval: 25000
});

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({limit: '10mb'}));

// In-memory storage for rooms
const rooms = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  console.log('   Transport:', socket.conn.transport.name);
  console.log('   Connected at:', new Date().toISOString());

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

    // Track room users and current data
    if (!rooms.has(roomCode)) {
      rooms.set(roomCode, {
        users: new Set(),
        messages: [] // Store history in memory for the room
      });
    }

    const room = rooms.get(roomCode);
    room.users.add(socket.id);

    console.log(`Client ${socket.id} joined room: ${roomCode}`);

    // Notify client of successful join and send message history
    socket.emit('room-joined', {
      roomCode,
      messages: room.messages
    });

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
      const room = rooms.get(roomCode);
      room.users.delete(socket.id);

      // Clean up empty rooms
      if (room.users.size === 0) {
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

    const msgObj = { type: 'text', message, timestamp };
    if (rooms.has(roomCode)) {
      rooms.get(roomCode).messages.push(msgObj);
      // Optional: limit history size per room to prevent memory leaks
      if (rooms.get(roomCode).messages.length > 100) {
        rooms.get(roomCode).messages.shift();
      }
    }

    // Broadcast update to everyone
    io.to(roomCode).emit('receive-message', {
      ...msgObj,
      socketId: socket.id
    });
  });

  // Handle file metadata sending (actual file sent via HTTP)
  socket.on('send-file-metadata', ({ roomCode, fileData, timestamp }) => {
    const msgObj = { type: 'file', fileData, timestamp };
    if (rooms.has(roomCode)) {
      rooms.get(roomCode).messages.push(msgObj);
      if (rooms.get(roomCode).messages.length > 100) {
        // Here we could also delete the actual file buffers if they are tracked separately
        rooms.get(roomCode).messages.shift();
      }
    }

    io.to(roomCode).emit('receive-file', {
      ...msgObj,
      socketId: socket.id
    });
  });


  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Remove user from all rooms and clean up empty rooms
    rooms.forEach((room, roomCode) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);

        if (room.users.size === 0) {
          rooms.delete(roomCode);
          console.log(`Room ${roomCode} is empty and has been deleted`);
        } else {
          updateRoomUsers(roomCode);
        }
      }
    });
  });
});

// HTTP endpoints for large file uploads
// Map of fileId -> { buffer, name, type, size, roomCode }
const filesStorage = new Map();

app.post('/upload', upload.array('files'), (req, res) => {
  const roomCode = req.body.roomCode;
  if (!roomCode || !rooms.has(roomCode)) {
    return res.status(400).json({ error: 'Invalid room' });
  }

  const uploadedFiles = [];

  req.files.forEach(file => {
    const fileId = Math.random().toString(36).substring(2, 15);
    filesStorage.set(fileId, {
      buffer: file.buffer,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      roomCode: roomCode
    });

    // Notify connected clients about this file via websocket or let frontend do it
    uploadedFiles.push({
      fileId,
      name: file.originalname,
      type: file.mimetype,
      size: file.size
    });
  });

  res.json({ success: true, files: uploadedFiles });
});

app.get('/download/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  const file = filesStorage.get(fileId);

  if (!file) {
    return res.status(404).send('File not found or expired');
  }

  res.setHeader('Content-Type', file.type);
  res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
  res.send(file.buffer);
});

// Helper function to update room user count
function updateRoomUsers(roomCode) {
  const room = rooms.get(roomCode);
  if (room) {
    io.to(roomCode).emit('room-users-update', room.users.size);
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
});
