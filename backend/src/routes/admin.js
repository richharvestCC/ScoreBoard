const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { roles, requireActiveAccount } = require('../middleware/rbac');
const rateLimit = require('express-rate-limit');

// Rate limiting for admin operations
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 admin requests per windowMs
  message: {
    success: false,
    message: 'Too many admin requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting and authentication to all admin routes
router.use(adminRateLimit);
router.use(authenticateToken);
router.use(requireActiveAccount());
router.use(roles.ADMIN_MODERATOR); // Only admin and moderator can access

/**
 * @route   GET /api/v1/admin/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin/Moderator)
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with filtering and pagination
 * @access  Private (Admin/Moderator)
 * @query   page, limit, role, is_active, search, sort_by, sort_order
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get user by ID with detailed information
 * @access  Private (Admin/Moderator)
 * @param   id - User ID
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @route   PUT /api/v1/admin/users/:id
 * @desc    Update user information
 * @access  Private (Admin/Moderator)
 * @param   id - User ID
 * @body    User data (role, is_active, permissions)
 */
router.put('/users/:id', adminController.updateUser);

/**
 * @route   GET /api/v1/admin/users/:id/activity
 * @desc    Get user activity statistics
 * @access  Private (Admin/Moderator)
 * @param   id - User ID
 */
router.get('/users/:id/activity', adminController.getUserActivity);

/**
 * @route   GET /api/v1/admin/system/status
 * @desc    Get system status and health check
 * @access  Private (Admin only)
 */
router.get('/system/status', roles.ADMIN_ONLY, adminController.getSystemStatus);

module.exports = router;