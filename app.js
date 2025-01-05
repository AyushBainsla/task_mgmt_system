const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const { authenticateJWT } = require('./middlewares/authMiddleware');
const { roleBasedAccessControl } = require('./middlewares/rbacMiddleware');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// WebSocket Integration
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

app.set('io', io);

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', authenticateJWT, roleBasedAccessControl, taskRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// Database connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
