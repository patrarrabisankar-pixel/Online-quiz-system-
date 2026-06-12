const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const { auth } = require('../middleware/auth');
const { validateAnswerSubmit } = require('../middleware/validation');

router.post('/submit-answer', auth, validateAnswerSubmit, answerController.submitAnswer);
router.post('/submit-quiz', auth, answerController.submitQuiz);
router.get('/result/:id', auth, answerController.getResult);

module.exports = router;
