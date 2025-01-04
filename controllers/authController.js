const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Default role to "User" if not provided
      const assignedRole = role || "User";
      console.log('Role-->',assignedRole);
  
      const user = new User({
        username,
        email,
        password: hashedPassword,
        roles: [assignedRole],
      });
  
      await user.save();
  
      res.status(200).json({ message: "User registered successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error registering user" });
    }
  };
  

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const logout = (req, res) => {
    res.status(200).json({ message: 'User logged out' });
};

const getProfile = async (req, res) => {
  try {
      let users;

      if (req.hasRole('Admin')) {
          // Admin can see all user profiles
          users = await User.find({});
      } else if (req.hasRole('Manager')) {
          // Manager can see profiles of their team members
          users = await User.find({ manager: req.user._id });
      } else {
          // Regular user can only see their own profile
          users = await User.find({ _id: req.user._id });
      }

      if (!users || users.length === 0) {
          return res.status(404).json({ message: 'No users found' });
      }

      res.status(200).json(users);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


const updateProfile = async (req, res) => {
  try {
      let user;

      if (req.hasRole('Admin')) {
          // Admin can update any user's profile
          const { id } = req.params; // User ID to update profile
          user = await User.findByIdAndUpdate(id, req.body, { new: true });
      } else if (req.hasRole('Manager')) {
          // Manager can update profiles within their team
          const { id } = req.params; // User ID to update profile
          user = await User.findOneAndUpdate(
              { _id: id, manager: req.user._id },
              req.body,
              { new: true }
          );
      } else {
          // Regular user can update only their own profile
          if (req.params.id !== req.user._id.toString()) {
              return res.status(403).json({ message: 'Access denied' });
          }
          user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
      }

      if (!user) return res.status(404).json({ message: 'User not found' });

      res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


const assignManager = async (req, res) => {
  const { id } = req.params;
  const { manager } = req.body;

  try {
      const user = await User.findByIdAndUpdate(
          id,
          { manager },
          { new: true }
      );

      if (!user) return res.status(404).json({ message: 'User not found' });

      res.status(200).json({ message: 'Manager assigned successfully', user });
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
};

const getTeamMembers = async (req, res) => {
  const { id } = req.params; // Manager ID

  try {
      const teamMembers = await User.find({ manager: id });
      res.status(200).json(teamMembers);
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
};


module.exports = { register, login, logout, getProfile, assignManager, getTeamMembers, updateProfile};
