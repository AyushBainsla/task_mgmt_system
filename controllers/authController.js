const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const assignedRole = role || "User";

        const user = new User({
            username,
            email,
            password: hashedPassword,
            roles: [assignedRole],
        });

        await user.save();

        res.status(200).json({ message: "User registered successfully", user });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const logout = (req, res) => {
    try {
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getProfile = async (req, res) => {
    try {
        let users;

        if (req.hasRole('Admin')) {
            users = await User.find({});
        } else if (req.hasRole('Manager')) {
            users = await User.find({ manager: req.user._id });
        } else {
            users = await User.find({ _id: req.user._id });
        }

        if (!users || users.length === 0) {
            return res.status(404).json({ error: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        let user;

        if (req.hasRole('Admin')) {
            const { id } = req.params;
            user = await User.findByIdAndUpdate(id, req.body, { new: true });
        } else if (req.hasRole('Manager')) {
            const { id } = req.params;
            user = await User.findOneAndUpdate(
                { _id: id, manager: req.user._id },
                req.body,
                { new: true }
            );
        } else {
            if (req.params.id !== req.user._id.toString()) {
                return res.status(403).json({ error: "Access denied" });
            }
            user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const assignManager = async (req, res) => {
    const { id } = req.params;
    const { manager } = req.body;

    try {
        if (!manager) {
            return res.status(400).json({ error: "Manager ID is required" });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { manager },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json({ message: "Manager assigned successfully", user });
    } catch (error) {
        console.error("Assign Manager Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getTeamMembers = async (req, res) => {
    const { id } = req.params;

    try {
        const teamMembers = await User.find({ manager: id });
        if (!teamMembers || teamMembers.length === 0) {
            return res.status(404).json({ error: "No team members found" });
        }

        res.status(200).json(teamMembers);
    } catch (error) {
        console.error("Get Team Members Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    assignManager,
    getTeamMembers,
};
