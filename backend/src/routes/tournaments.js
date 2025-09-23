const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { authenticateToken } = require('../middleware/auth');
const { validateTournamentCreation, validateTournamentUpdate, validateTournamentJoin } = require('../middleware/validation');

// All tournament routes require authentication
router.use(authenticateToken);

// Tournament CRUD operations
router.post('/', validateTournamentCreation, tournamentController.createTournament);
router.get('/', tournamentController.getAllTournaments);
router.get('/:id', tournamentController.getTournamentById);
router.put('/:id', validateTournamentUpdate, tournamentController.updateTournament);
router.delete('/:id', tournamentController.deleteTournament);

// Tournament participation operations
router.post('/:id/join', validateTournamentJoin, tournamentController.joinTournament);
router.post('/:id/leave', tournamentController.leaveTournament);

// Tournament data operations
router.get('/:id/participants', tournamentController.getTournamentParticipants);
router.get('/:id/matches', tournamentController.getTournamentMatches);

// Tournament bracket operations
router.post('/:id/bracket/generate', tournamentController.generateBracket);
router.get('/:id/bracket', tournamentController.getBracket);
router.put('/:id/bracket/match/:matchId', tournamentController.updateBracketMatch);

module.exports = router;