const Task = require('../models/Task');

const createTask = async (req, res) => {
    const { title, description, dueDate, priority } = req.body;

    try {
        const task = new Task({
            title,
            description,
            dueDate,
            priority,
            createdBy: req.user._id,
        });

        await task.save();
        // Emit event for real-time updates
        const io = req.app.get('io');
        io.emit('taskCreated', task);
        res.status(200).json({ message: 'Task created successfully', task });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const { status, priority, due_date, search } = req.query;
        const query = {};

        // Apply filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (due_date) query.due_date = { $lte: new Date(due_date) };
        if (search) query.name = { $regex: search, $options: 'i' };

        let tasks;

        if (req.hasRole('Admin')) {
            // Admin can see all tasks
            tasks = await Task.find(query);
        } else if (req.hasRole('Manager')) {
            // Manager can see tasks assigned to their team members
            const teamMembers = await User.find({ manager: req.user._id }).select('_id');
            const teamMemberIds = teamMembers.map((member) => member._id);
            tasks = await Task.find({ ...query, assignedTo: { $in: teamMemberIds } });
        } else {
            // Regular users can see only their tasks
            tasks = await Task.find({ ...query, assignedTo: req.user._id });
        }

        res.status(200).json(tasks);
    } catch (err) {
        res.status(400).json({ message: err.message });
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

        // Emit event for task updates
        const io = req.app.get('io');
        io.emit('taskUpdated', task);

        res.status(200).json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findByIdAndDelete(id);

        if (!task) return res.status(404).json({ message: 'Task not found' });

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const assignTask = async (req, res) => {
    const { taskId, userId } = req.body;

    try {
        const task = await Task.findByIdAndUpdate(
            taskId,
            { assignedTo: userId },
            { new: true }
        );

        if (!task) return res.status(404).json({ message: 'Task not found' });

        res.status(200).json({ message: 'Task assigned successfully', task });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const viewAssignedTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(400).json({ message: err.message });
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

        res.json({
            completedTasks,
            pendingTasks,
            overdueTasks,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUserTaskStatistics = async (req, res) => {
    try {
        const { userId } = req.params;

        const completedTasks = await Task.countDocuments({ 
            createdBy: userId, 
            status: 'Completed' 
        });
        const pendingTasks = await Task.countDocuments({ 
            createdBy: userId, 
            status: 'Pending' 
        });
        const overdueTasks = await Task.countDocuments({ 
            createdBy: userId,
            status: { $ne: 'Completed' },
            dueDate: { $lt: new Date() }
        });

        res.json({
            userId,
            completedTasks,
            pendingTasks,
            overdueTasks,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = { createTask, getTasks, updateTask, deleteTask, assignTask, viewAssignedTasks, getTaskAnalytics, getUserTaskStatistics};
