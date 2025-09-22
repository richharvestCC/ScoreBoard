const express = require('express');
const matchController = require('../controllers/matchController');
const { auth } = require('../middleware/auth');
const { validateMatchCreation, validateMatchEventCreation } = require('../middleware/validation');

const router = express.Router();

router.use(auth);

router.post('/', validateMatchCreation, matchController.createMatch);
router.get('/', matchController.getAllMatches);
router.get('/:id', matchController.getMatchById);
router.put('/:id', matchController.updateMatch);
router.delete('/:id', matchController.deleteMatch);

router.post('/:id/events', validateMatchEventCreation, matchController.addMatchEvent);
router.get('/:id/events', matchController.getMatchEvents);

module.exports = router;