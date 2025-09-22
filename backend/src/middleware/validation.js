const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    next();
  };
};

// User validation schemas
const registerSchema = Joi.object({
  user_id: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  name: Joi.string().min(1).max(100).required(),
  birthdate: Joi.date().iso().optional(),
  gender: Joi.string().valid('M', 'F', 'OTHER').optional(),
  phone_number: Joi.string().max(20).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Club validation schemas
const createClubSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  club_type: Joi.string().valid('general', 'pro', 'youth', 'national').optional().default('general'),
  description: Joi.string().optional(),
  location: Joi.string().min(1).max(200).optional(),
  founded_year: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
  logo_url: Joi.string().uri().optional(),
  contact_email: Joi.string().email().optional(),
  contact_phone: Joi.string().pattern(/^[\+]?[0-9\-\s]+$/).optional()
});

const updateClubSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  club_type: Joi.string().valid('general', 'pro', 'youth', 'national').optional(),
  description: Joi.string().optional(),
  location: Joi.string().min(1).max(200).optional(),
  founded_year: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
  logo_url: Joi.string().uri().optional(),
  contact_email: Joi.string().email().optional(),
  contact_phone: Joi.string().pattern(/^[\+]?[0-9\-\s]+$/).optional()
});

const joinClubSchema = Joi.object({
  role: Joi.string().valid('admin', 'player', 'coach', 'staff').optional(),
  jersey_number: Joi.number().integer().min(1).max(99).optional(),
  position: Joi.string().valid(
    'goalkeeper', 'defender', 'midfielder', 'forward',
    'center_back', 'left_back', 'right_back', 'defensive_midfielder',
    'central_midfielder', 'attacking_midfielder', 'left_winger',
    'right_winger', 'striker', 'center_forward'
  ).optional()
});

const updateMemberSchema = Joi.object({
  role: Joi.string().valid('admin', 'player', 'coach', 'staff').optional(),
  jersey_number: Joi.number().integer().min(1).max(99).optional(),
  position: Joi.string().valid(
    'goalkeeper', 'defender', 'midfielder', 'forward',
    'center_back', 'left_back', 'right_back', 'defensive_midfielder',
    'central_midfielder', 'attacking_midfielder', 'left_winger',
    'right_winger', 'striker', 'center_forward'
  ).optional(),
  status: Joi.string().valid('active', 'inactive', 'suspended', 'injured').optional()
});

// Match validation schemas
const createMatchSchema = Joi.object({
  home_club_id: Joi.string().uuid().required(),
  away_club_id: Joi.string().uuid().required(),
  match_date: Joi.date().iso().required(),
  venue: Joi.string().max(255).optional(),
  match_type: Joi.string().valid('practice', 'casual', 'friendly', 'tournament', 'a_friendly', 'a_tournament').optional().default('casual'),
  duration_minutes: Joi.number().integer().min(1).max(200).optional(),
  referee_name: Joi.string().max(100).optional(),
  weather: Joi.string().max(100).optional(),
  notes: Joi.string().optional()
});

// Match event validation schemas
const createMatchEventSchema = Joi.object({
  player_id: Joi.string().uuid().optional(),
  event_type: Joi.string().valid(
    'GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD',
    'SUBSTITUTION_IN', 'SUBSTITUTION_OUT',
    'PENALTY_GOAL', 'PENALTY_MISS', 'OWN_GOAL',
    'MATCH_START', 'MATCH_END', 'HALFTIME_START', 'HALFTIME_END'
  ).required(),
  minute: Joi.number().integer().min(0).max(200).required(),
  second: Joi.number().integer().min(0).max(59).optional(),
  description: Joi.string().optional(),
  metadata: Joi.object().optional()
});

module.exports = {
  validate,

  // Auth validation functions
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),

  // Club validation functions
  validateClubCreation: validate(createClubSchema),
  validateClubUpdate: validate(updateClubSchema),
  validateClubJoin: validate(joinClubSchema),
  validateMemberUpdate: validate(updateMemberSchema),

  // Match validation functions
  validateMatchCreation: validate(createMatchSchema),
  validateMatchEventCreation: validate(createMatchEventSchema),

  // Export schemas for direct use
  registerSchema,
  loginSchema,
  createClubSchema,
  updateClubSchema,
  joinClubSchema,
  updateMemberSchema,
  createMatchSchema,
  createMatchEventSchema
};

// Tournament validation schemas
const createTournamentSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  tournament_type: Joi.string().valid('league', 'tournament').required(),
  format: Joi.string().valid('round_robin', 'knockout', 'mixed').optional().default('knockout'),
  level: Joi.string().valid('local', 'national', 'international').optional().default('local'),
  description: Joi.string().optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).optional(),
  max_participants: Joi.number().integer().min(2).max(128).optional(),
  entry_fee: Joi.number().min(0).optional(),
  prize_description: Joi.string().optional(),
  rules: Joi.string().optional(),
  is_public: Joi.boolean().optional().default(true),
  has_group_stage: Joi.boolean().optional().default(false)
});

const updateTournamentSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  tournament_type: Joi.string().valid('league', 'tournament').optional(),
  format: Joi.string().valid('round_robin', 'knockout', 'mixed').optional(),
  level: Joi.string().valid('local', 'national', 'international').optional(),
  description: Joi.string().optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  max_participants: Joi.number().integer().min(2).max(128).optional(),
  entry_fee: Joi.number().min(0).optional(),
  prize_description: Joi.string().optional(),
  rules: Joi.string().optional(),
  is_public: Joi.boolean().optional(),
  has_group_stage: Joi.boolean().optional(),
  status: Joi.string().valid('draft', 'open', 'closed', 'in_progress', 'completed', 'cancelled').optional()
});

const joinTournamentSchema = Joi.object({
  club_id: Joi.string().uuid().required()
});

module.exports = {
  validate,

  // Auth validation functions
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),

  // Club validation functions
  validateClubCreation: validate(createClubSchema),
  validateClubUpdate: validate(updateClubSchema),
  validateClubJoin: validate(joinClubSchema),
  validateMemberUpdate: validate(updateMemberSchema),

  // Match validation functions
  validateMatchCreation: validate(createMatchSchema),
  validateMatchEventCreation: validate(createMatchEventSchema),

  // Tournament validation functions
  validateTournamentCreation: validate(createTournamentSchema),
  validateTournamentUpdate: validate(updateTournamentSchema),
  validateTournamentJoin: validate(joinTournamentSchema),

  // Export schemas for direct use
  registerSchema,
  loginSchema,
  createClubSchema,
  updateClubSchema,
  joinClubSchema,
  updateMemberSchema,
  createMatchSchema,
  createMatchEventSchema,
  createTournamentSchema,
  updateTournamentSchema,
  joinTournamentSchema
};