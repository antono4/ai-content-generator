/**
 * AetherOS Backend Server
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { aiRouter } from './routes/api/ai.js';
import { knowledgeRouter } from './routes/api/knowledge.js';
import { appsRouter } from './routes/api/apps.js';
import { filesRouter } from './routes/api/files.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/ai', aiRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/apps', appsRouter);
app.use('/api/files', filesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join session room
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  // Handle AI streaming
  socket.on('ai-stream', async (data) => {
    const { sessionId, prompt, context } = data;
    
    // Import here to avoid circular dependency
    const { AIKernel } = await import('./services/ai/Kernel.js');
    const kernel = new AIKernel({ sessionId });

    try {
      for await (const chunk of kernel.processStream(prompt, context)) {
        if (chunk.error) {
          socket.emit('ai-error', { sessionId, error: chunk.error });
          break;
        }
        
        socket.emit('ai-chunk', { 
          sessionId, 
          content: chunk.content,
          done: chunk.done,
        });
      }
    } catch (error) {
      socket.emit('ai-error', { sessionId, error: error.message });
    }
  });

  // Spatial node events
  socket.on('node-click', (data) => {
    io.to(data.sessionId).emit('node-selected', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     █████╗ ██╗██████╗ ███████╗██╗   ██╗██████╗ ███████╗   ║
║    ██╔══██╗██║██╔══██╗██╔════╝██║   ██║██╔══██╗██╔════╝   ║
║    ███████║██║██████╔╝███████╗██║   ██║██████╔╝█████╗     ║
║    ██╔══██║██║██╔══██╗╚════██║██║   ██║██╔══██╗██╔══╝     ║
║    ██║  ██║██║██║  ██║███████║╚██████╔╝██║  ██║███████╗   ║
║    ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝   ║
║                                                           ║
║    Cognitive Spatial Operating System                      ║
║    Backend Server v0.1.0                                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Server running on port ${PORT}
API available at http://localhost:${PORT}/api
WebSocket available at ws://localhost:${PORT}
  `);
});

export { app, io };
