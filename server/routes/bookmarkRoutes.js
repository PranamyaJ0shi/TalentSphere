const express = require('express');
const router = express.Router();
const { toggleBookmark, deleteBookmark, getBookmarks } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getBookmarks)
  .post(toggleBookmark);

router.route('/:id')
  .delete(deleteBookmark);

module.exports = router;
