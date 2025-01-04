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
        res.status(200).json({ message: 'Task created successfully', task });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getTasks = async (req, res) => {
    try {
        let tasks;

        if (req.hasRole('Admin')) {
            tasks = await Task.find({});
        } else if (req.hasRole('Manager')) {
            const teamMembers = await User.find({ manager: req.user._id }).select('_id');
            const teamMemberIds = teamMembers.map((member) => member._id);
            tasks = await Task.find({ assignedTo: { $in: teamMemberIds } });
        } else {
            tasks = await Task.find({ assignedTo: req.user._id });
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

module.exports = { createTask, getTasks, updateTask, deleteTask, assignTask, viewAssignedTasks };
