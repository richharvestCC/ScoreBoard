const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { authenticateToken } = require('../middleware/auth');
const { validateClubCreation, validateClubUpdate, validateMemberUpdate } = require('../middleware/validation');

// All club routes require authentication
router.use(authenticateToken);

// Club CRUD operations
router.post('/', validateClubCreation, clubController.createClub);
router.get('/', clubController.getAllClubs);
router.get('/:id', clubController.getClubById);
router.put('/:id', validateClubUpdate, clubController.updateClub);
router.delete('/:id', clubController.deleteClub);

// Club membership operations
router.post('/:id/join', clubController.joinClub);
router.post('/:id/leave', clubController.leaveClub);
router.get('/:id/members', clubController.getClubMembers);

// Club member management (admin only)
router.put('/:id/members/:memberId', validateMemberUpdate, clubController.updateMember);
router.delete('/:id/members/:memberId', clubController.removeMember);

module.exports = router;