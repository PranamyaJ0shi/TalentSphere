const express = require('express');
const router = express.Router();
const { submitAnswer, getMyAnswers, getHistory } = require('../controllers/answerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', submitAnswer);
router.get('/me', getMyAnswers);

module.exports = router;
