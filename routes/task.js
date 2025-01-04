const express = require('express');
const {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    assignTask,
    viewAssignedTasks,
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

module.exports = router;
