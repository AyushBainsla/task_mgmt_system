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

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a task
 *     description: Create a new task in the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *             required:
 *               - title
 *               - description
 *     responses:
 *       201:
 *         description: Task created successfully.
 *       400:
 *         description: Bad request, invalid input.
 */
router.post('/', createTask);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieve a list of all tasks in the system.
 *     responses:
 *       200:
 *         description: Successfully retrieved tasks.
 *       500:
 *         description: Server error.
 */
router.get('/', getTasks);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: Update the details of a task by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *       404:
 *         description: Task not found.
 */
router.put('/:id', updateTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Delete a task by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID.
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *       404:
 *         description: Task not found.
 */
router.delete('/:id', deleteTask);

// Task Assignment

/**
 * @swagger
 * /api/v1/tasks/assign:
 *   post:
 *     summary: Assign a task
 *     description: Assign a task to a specific user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskId:
 *                 type: string
 *               userId:
 *                 type: string
 *             required:
 *               - taskId
 *               - userId
 *     responses:
 *       200:
 *         description: Task assigned successfully.
 *       404:
 *         description: Task or user not found.
 */
router.post('/assign', assignTask);

/**
 * @swagger
 * /api/v1/tasks/assigned:
 *   get:
 *     summary: View assigned tasks
 *     description: Retrieve all tasks assigned to the current user.
 *     responses:
 *       200:
 *         description: Successfully retrieved assigned tasks.
 *       404:
 *         description: No assigned tasks found.
 */
router.get('/assigned', viewAssignedTasks);

/**
 * @swagger
 * /api/v1/tasks/analytics:
 *   get:
 *     summary: Get task analytics
 *     description: Retrieve overall analytics for tasks.
 *     responses:
 *       200:
 *         description: Successfully retrieved task analytics.
 *       500:
 *         description: Server error.
 */
router.get('/analytics', getTaskAnalytics);

/**
 * @swagger
 * /api/v1/tasks/analytics/{userId}:
 *   get:
 *     summary: Get user task statistics
 *     description: Retrieve task statistics for a specific user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID.
 *     responses:
 *       200:
 *         description: Successfully retrieved user task statistics.
 *       404:
 *         description: User or statistics not found.
 */
router.get('/analytics/:userId', getUserTaskStatistics);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get cached tasks
 *     description: Retrieve cached tasks with 60-second caching via Redis.
 *     responses:
 *       200:
 *         description: Successfully retrieved tasks from cache or database.
 *       500:
 *         description: Server error.
 */
router.get('/', cacheMiddleware, async (req, res) => {
    const tasks = await Task.find(); 
    redisClient.set(req.originalUrl, JSON.stringify(tasks), { EX: 60 }); // Cache for 60 seconds
    res.json(tasks);
});

module.exports = router;
