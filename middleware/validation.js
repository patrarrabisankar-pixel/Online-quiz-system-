const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation
const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty().trim(),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors
];

// Quiz validation
const validateQuizCreate = [
  body('title').notEmpty().trim(),
  body('description').optional().trim(),
  body('duration_minutes').isInt({ min: 1 }),
  body('passing_score').isInt({ min: 0, max: 100 }),
  handleValidationErrors
];

// Question validation
const validateQuestionCreate = [
  body('quiz_id').isInt(),
  body('question_text').notEmpty().trim(),
  body('question_type').isIn(['multiple_choice', 'true_false', 'short_answer']),
  body('points').isInt({ min: 1 }),
  handleValidationErrors
];

// Answer validation
const validateAnswerSubmit = [
  body('quizResultId').isInt(),
  body('questionId').isInt(),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateQuizCreate,
  validateQuestionCreate,
  validateAnswerSubmit
};
