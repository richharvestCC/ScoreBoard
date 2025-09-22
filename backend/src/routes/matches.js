const express = require('express');
const matchController = require('../controllers/matchController');
const { authenticateToken } = require('../middleware/auth');
const { validateMatchCreation, validateMatchEventCreation } = require('../middleware/validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/', validateMatchCreation, matchController.createMatch);
router.get('/', matchController.getAllMatches);
router.get('/:id', matchController.getMatchById);
router.put('/:id', matchController.updateMatch);
router.delete('/:id', matchController.deleteMatch);

router.post('/:id/events', validateMatchEventCreation, matchController.addMatchEvent);
router.get('/:id/events', matchController.getMatchEvents);

// Match statistics routes
router.get('/:id/statistics', matchController.getMatchStatistics);
router.put('/:id/statistics', matchController.updateMatchStatistics);
router.post('/:id/statistics/calculate', matchController.calculateStatisticsFromEvents);

module.exports = router;