const express = require('express');
const router = express.Router();
const { getStudentAnalytics, getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/student', protect, getStudentAnalytics);
router.get('/admin', protect, adminOnly, getAdminAnalytics);

module.exports = router;
