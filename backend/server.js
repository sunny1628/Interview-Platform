import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import connectDB from './database/db.js';
import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';

dotenv.config();
const app = express();

// Create HTTP server for Socket.IO to attach to
const server = http.createServer(app);

// Setup Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/interview', interviewRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Hello neeraj');
});

// Socket.IO signaling logic
const roomMembers = {};

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`📥 User ${socket.id} joined room ${roomId}`);

    // Track room members
    if (!roomMembers[roomId]) roomMembers[roomId] = [];
    roomMembers[roomId].push(socket.id);

    const others = roomMembers[roomId].filter((id) => id !== socket.id);
    if (others.length > 0) {
      socket.emit('initiate-call', others[0]); // Tell new user to initiate
    }
  });

  socket.on('send-signal', ({ targetId, signal }) => {
    io.to(targetId).emit('receive-signal', { signal, callerId: socket.id });
  });

  socket.on('return-signal', ({ callerId, signal }) => {
    io.to(callerId).emit('accept-signal', { signal, id: socket.id });
  });

  socket.on('codeChange', ({ interviewId, code }) => {
    socket.to(interviewId).emit('codeUpdate', code);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    for (const room in roomMembers) {
      roomMembers[room] = roomMembers[room].filter((id) => id !== socket.id);
      if (roomMembers[room].length === 0) delete roomMembers[room];
    }
  });
});

// Start the combined HTTP + WebSocket server
server.listen(process.env.PORT, () => {
  console.log(`🚀 Server (with Socket.IO) running on port ${process.env.PORT}`);
});
