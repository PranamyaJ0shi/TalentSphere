const Bookmark = require('../models/Bookmark');
const Question = require('../models/Question');

// @desc    Toggle a bookmark (Add/Remove)
// @route   POST /api/bookmarks
// @access  Private
exports.toggleBookmark = async (req, res) => {
  try {
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({ success: false, message: 'Question ID is required' });
    }

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      userId: req.user.id,
      questionId,
    });

    if (existingBookmark) {
      // Remove bookmark
      await existingBookmark.deleteOne();
      return res.status(200).json({
        success: true,
        isBookmarked: false,
        message: 'Bookmark removed',
      });
    } else {
      // Add bookmark
      const bookmark = await Bookmark.create({
        userId: req.user.id,
        questionId,
      });
      return res.status(201).json({
        success: true,
        isBookmarked: true,
        data: bookmark,
        message: 'Bookmark added',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove bookmark by question id
// @route   DELETE /api/bookmarks/:id
// @access  Private
exports.deleteBookmark = async (req, res) => {
  try {
    const questionId = req.params.id;

    const bookmark = await Bookmark.findOne({
      userId: req.user.id,
      questionId,
    });

    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }

    await bookmark.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Bookmark removed',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's bookmarked questions
// @route   GET /api/bookmarks
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user.id }).populate({
      path: 'questionId',
      select: 'title description role difficulty tags estimatedTime',
    });

    // Format list, filter out null questions (in case question was deleted)
    const bookmarkedQuestions = bookmarks
      .filter((b) => b.questionId !== null)
      .map((b) => ({
        _id: b.questionId._id,
        bookmarkId: b._id,
        title: b.questionId.title,
        description: b.questionId.description,
        role: b.questionId.role,
        difficulty: b.questionId.difficulty,
        tags: b.questionId.tags,
        estimatedTime: b.questionId.estimatedTime,
        createdAt: b.createdAt,
      }));

    res.status(200).json({
      success: true,
      count: bookmarkedQuestions.length,
      data: bookmarkedQuestions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
