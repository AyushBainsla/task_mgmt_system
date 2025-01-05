const express = require('express');
const cacheMiddleware = require('../middlewares/cacheMiddleware');
const redisClient = require('../app').redisClient;
const Task = require('../models/Task');

const {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    assignTask,
    viewAssignedTasks,
    getTaskAnalytics,
    getUserTaskStatistics
} = require('../controllers/taskController');

const router = express.Router();

// CRUD Operations
router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Task Assignment
router.post('/assign', assignTask);
router.get('/assigned', viewAssignedTasks);

router.get('/analytics', getTaskAnalytics);
router.get('/analytics/:userId', getUserTaskStatistics);

router.get('/', cacheMiddleware, async (req, res) => {
    const tasks = await Task.find(); 
    redisClient.set(req.originalUrl, JSON.stringify(tasks), { EX: 60 }); // Cache for 60 seconds
    res.json(tasks);
});

module.exports = router;
