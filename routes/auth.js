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


/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a user with a username, email, password, and optional role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/register', register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticate user with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful.
 *       400:
 *         description: Invalid credentials.
 */
router.post('/login', loginLimiter, login);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out a user
 *     description: Log out an authenticated user and invalidate their session.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful.
 *       401:
 *         description: Unauthorized, user not authenticated.
 */
router.post('/logout', authenticateJWT, logout);

/**
 * @swagger
 * /api/v1/profiles:
 *   get:
 *     summary: Get user profiles
 *     description: Retrieve a list of user profiles. Requires authentication and role-based access.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved profiles.
 *       403:
 *         description: Forbidden, insufficient permissions.
 */
router.get('/profiles', authenticateJWT, roleBasedAccessControl, getProfile);

/**
 * @swagger
 * /api/v1/update/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the profile of an authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Bad request, invalid input.
 */
router.put('/update/profile', authenticateJWT, updateProfile);

/**
 * @swagger
 * /api/v1/{id}/assign-manager:
 *   put:
 *     summary: Assign manager to a user
 *     description: Assign a manager to a specific user by their ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               managerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Manager assigned successfully.
 *       404:
 *         description: User not found.
 */
router.put('/:id/assign-manager', authenticateJWT, assignManager);

/**
 * @swagger
 * /api/v1/{id}/team-members:
 *   get:
 *     summary: Get team members
 *     description: Retrieve the list of team members under a specific user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID.
 *     responses:
 *       200:
 *         description: Successfully retrieved team members.
 *       404:
 *         description: User or team members not found.
 */
router.get('/:id/team-members', authenticateJWT, getTeamMembers);

module.exports = router;
