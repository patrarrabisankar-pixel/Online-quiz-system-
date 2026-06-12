const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');
const { validateQuizCreate } = require('../middleware/validation');

router.post('/quizzes', adminAuth, validateQuizCreate, adminController.createQuiz);
router.put('/quizzes/:id', adminAuth, adminController.updateQuiz);
router.delete('/quizzes/:id', adminAuth, adminController.deleteQuiz);
router.get('/results', adminAuth, adminController.getAllResults);

module.exports = router;
