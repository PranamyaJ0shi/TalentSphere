const express = require('express');
const router = express.Router();
const { getHistory } = require('../controllers/answerController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getHistory);

module.exports = router;
