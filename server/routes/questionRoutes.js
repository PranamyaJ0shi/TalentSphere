const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/questionController');
const { protect, adminOnly } = require('../middleware/auth');

router
  .route('/')
  .get(getQuestions)
  .post(protect, adminOnly, createQuestion);

router
  .route('/:id')
  .get(getQuestionById)
  .put(protect, adminOnly, updateQuestion)
  .delete(protect, adminOnly, deleteQuestion);

module.exports = router;
