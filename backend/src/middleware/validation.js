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
  description: Joi.string().optional(),
  founded_date: Joi.date().iso().optional(),
  location: Joi.string().max(255).optional(),
  contact_email: Joi.string().email().optional(),
  contact_phone: Joi.string().max(20).optional()
});

// Match validation schemas
const createMatchSchema = Joi.object({
  home_club_id: Joi.string().uuid().required(),
  away_club_id: Joi.string().uuid().required(),
  match_date: Joi.date().iso().required(),
  venue: Joi.string().max(255).optional(),
  match_type: Joi.string().valid('FRIENDLY', 'LEAGUE', 'TOURNAMENT', 'TRAINING').optional(),
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
  registerSchema,
  loginSchema,
  createClubSchema,
  createMatchSchema,
  createMatchEventSchema
};