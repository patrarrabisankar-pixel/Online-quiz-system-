const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { adminAuth } = require('../middleware/auth');
const { validateQuestionCreate } = require('../middleware/validation');

router.post('/', adminAuth, validateQuestionCreate, questionController.createQuestion);
router.put('/:id', adminAuth, questionController.updateQuestion);
router.delete('/:id', adminAuth, questionController.deleteQuestion);

module.exports = router;
