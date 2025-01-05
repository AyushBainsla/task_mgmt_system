const express = require('express');
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

module.exports = router;
