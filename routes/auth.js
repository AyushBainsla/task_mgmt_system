const express = require('express');
const { register, login, logout, getProfile, assignManager, getTeamMembers, updateProfile } = require('../controllers/authController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { roleBasedAccessControl } = require('../middlewares/rbacMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateJWT, logout);
router.get('/profiles', authenticateJWT, roleBasedAccessControl, getProfile);
router.put('/update/profile', authenticateJWT, updateProfile);
router.put('/:id/assign-manager', authenticateJWT, assignManager);
router.get('/:id/team-members', authenticateJWT, getTeamMembers);

module.exports = router;
