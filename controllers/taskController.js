const Task = require('../models/Task');

const createTask = async (req, res) => {
    const { title, description, dueDate, priority } = req.body;

    try {
        if (!title || !dueDate || !priority) {
            return res.status(400).json({ message: 'Title, dueDate, and priority are required fields' });
        }

        const task = new Task({
            title,
            description,
            dueDate,
            priority,
            createdBy: req.user._id,
        });

        await task.save();

        const io = req.app.get('io');
        io.emit('taskCreated', task);

        res.status(201).json({ message: 'Task created successfully', task });
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ message: 'Failed to create task', error: err.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const { status, priority, due_date, search } = req.query;
        const query = {};

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (due_date) query.dueDate = { $lte: new Date(due_date) };
        if (search) query.title = { $regex: search, $options: 'i' };

        let tasks;
        if (req.hasRole('Admin')) {
            tasks = await Task.find(query);
        } else if (req.hasRole('Manager')) {
            const teamMembers = await User.find({ manager: req.user._id }).select('_id');
            const teamMemberIds = teamMembers.map((member) => member._id);
            tasks = await Task.find({ ...query, assignedTo: { $in: teamMemberIds } });
        } else {
            tasks = await Task.find({ ...query, assignedTo: req.user._id });
        }

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found' });
        }

        res.status(200).json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
    }
};

const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate, priority, status } = req.body;

    try {
        const task = await Task.findByIdAndUpdate(
            id,
            { title, description, dueDate, priority, status },
            { new: true }
        );

        if (!task) return res.status(404).json({ message: 'Task not found' });

        const io = req.app.get('io');
        io.emit('taskUpdated', task);

        res.status(200).json({ message: 'Task updated successfully', task });
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ message: 'Failed to update task', error: err.message });
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findByIdAndDelete(id);

        if (!task) return res.status(404).json({ message: 'Task not found' });

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ message: 'Failed to delete task', error: err.message });
    }
};

const assignTask = async (req, res) => {
    const { taskId, userId } = req.body;

    try {
        if (!taskId || !userId) {
            return res.status(400).json({ message: 'Task ID and User ID are required' });
        }

        const task = await Task.findByIdAndUpdate(
            taskId,
            { assignedTo: userId },
            { new: true }
        );

        if (!task) return res.status(404).json({ message: 'Task not found' });

        res.status(200).json({ message: 'Task assigned successfully', task });
    } catch (err) {
        console.error('Error assigning task:', err);
        res.status(500).json({ message: 'Failed to assign task', error: err.message });
    }
};

const viewAssignedTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'No assigned tasks found' });
        }

        res.status(200).json(tasks);
    } catch (err) {
        console.error('Error fetching assigned tasks:', err);
        res.status(500).json({ message: 'Failed to fetch assigned tasks', error: err.message });
    }
};

const getTaskAnalytics = async (req, res) => {
    try {
        const completedTasks = await Task.countDocuments({ status: 'Completed' });
        const pendingTasks = await Task.countDocuments({ status: 'Pending' });
        const overdueTasks = await Task.countDocuments({
            status: { $ne: 'Completed' },
            dueDate: { $lt: new Date() }
        });

        res.status(200).json({ completedTasks, pendingTasks, overdueTasks });
    } catch (err) {
        console.error('Error fetching task analytics:', err);
        res.status(500).json({ message: 'Failed to fetch task analytics', error: err.message });
    }
};

const getUserTaskStatistics = async (req, res) => {
    const { userId } = req.params;

    try {
        if (!userId) return res.status(400).json({ message: 'User ID is required' });

        const completedTasks = await Task.countDocuments({ createdBy: userId, status: 'Completed' });
        const pendingTasks = await Task.countDocuments({ createdBy: userId, status: 'Pending' });
        const overdueTasks = await Task.countDocuments({
            createdBy: userId,
            status: { $ne: 'Completed' },
            dueDate: { $lt: new Date() }
        });

        res.status(200).json({ userId, completedTasks, pendingTasks, overdueTasks });
    } catch (err) {
        console.error('Error fetching user task statistics:', err);
        res.status(500).json({ message: 'Failed to fetch user task statistics', error: err.message });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    assignTask,
    viewAssignedTasks,
    getTaskAnalytics,
    getUserTaskStatistics
};
