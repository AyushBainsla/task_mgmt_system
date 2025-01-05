const express = require('express');
const { register, login, logout, getProfile, assignManager, getTeamMembers, updateProfile } = require('../controllers/authController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { roleBasedAccessControl } = require('../middlewares/rbacMiddleware');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Limit to 5 login attempts
    message: 'Too many login attempts, please try again later.',
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/logout', authenticateJWT, logout);
router.get('/profiles', authenticateJWT, roleBasedAccessControl, getProfile);
router.put('/update/profile', authenticateJWT, updateProfile);
router.put('/:id/assign-manager', authenticateJWT, assignManager);
router.get('/:id/team-members', authenticateJWT, getTeamMembers);

module.exports = router;
