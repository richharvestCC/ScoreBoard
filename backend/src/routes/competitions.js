const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for competition creation
const createCompetitionLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 competition creation requests per windowMs
  message: {
    success: false,
    message: 'Too many competition creation attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for general API calls
const generalApiLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many API requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all routes
router.use(generalApiLimit);

/**
 * @route   GET /api/competitions
 * @desc    Get all competitions with filtering and pagination
 * @access  Public
 * @query   page, limit, status, competition_type, level, season, search, includeTemplates
 */
router.get('/', competitionController.getAllCompetitions);

/**
 * @route   GET /api/competitions/templates
 * @desc    Get all competition templates
 * @access  Public
 */
router.get('/templates', competitionController.getTemplates);

/**
 * @route   GET /api/competitions/active
 * @desc    Get all active competitions
 * @access  Public
 */
router.get('/active', competitionController.getActiveCompetitions);

/**
 * @route   GET /api/competitions/my
 * @desc    Get user's competitions
 * @access  Private
 * @query   role (all, admin, creator, managed)
 */
router.get('/my', authenticateToken, competitionController.getUserCompetitions);

/**
 * @route   GET /api/competitions/:id
 * @desc    Get competition by ID
 * @access  Public
 * @param   id - Competition ID
 */
router.get('/:id', competitionController.getCompetitionById);

/**
 * @route   POST /api/competitions
 * @desc    Create a new competition
 * @access  Private
 * @body    Competition data (name, competition_type, format, etc.)
 */
router.post('/', authenticateToken, createCompetitionLimit, competitionController.createCompetition);

/**
 * @route   POST /api/competitions/from-template/:templateId
 * @desc    Create a new competition from template
 * @access  Private
 * @param   templateId - Template ID
 * @body    Competition data to override template defaults
 */
router.post('/from-template/:templateId', authenticateToken, createCompetitionLimit, competitionController.createFromTemplate);

/**
 * @route   PUT /api/competitions/:id
 * @desc    Update competition
 * @access  Private (Admin or Creator only)
 * @param   id - Competition ID
 * @body    Updated competition data
 */
router.put('/:id', authenticateToken, competitionController.updateCompetition);

/**
 * @route   PATCH /api/competitions/:id/status
 * @desc    Update competition status
 * @access  Private (Admin only)
 * @param   id - Competition ID
 * @body    { status: 'new_status' }
 */
router.patch('/:id/status', authenticateToken, competitionController.updateCompetitionStatus);

/**
 * @route   DELETE /api/competitions/:id
 * @desc    Delete competition
 * @access  Private (Creator only)
 * @param   id - Competition ID
 */
router.delete('/:id', authenticateToken, competitionController.deleteCompetition);

module.exports = router;