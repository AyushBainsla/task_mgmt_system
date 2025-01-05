const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const { authenticateJWT } = require('./middlewares/authMiddleware');
const { roleBasedAccessControl } = require('./middlewares/rbacMiddleware');
const redis = require('redis');
const redisClient = redis.createClient();
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
redisClient.connect().catch((err) => console.error('Redis connection error:', err));
app.set('redisClient', redisClient); // This Make Redis client globally accessible

// WebSocket Integration
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

app.set('io', io);


const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests
    message: 'Too many requests, please try again later.',
});

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(defaultLimiter);

// Database Connection
require('./connection/connection');

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', authenticateJWT, roleBasedAccessControl, taskRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const fs = require('fs');
fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2));


app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
