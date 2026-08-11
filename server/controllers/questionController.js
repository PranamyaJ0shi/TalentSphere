const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Bookmark = require('../models/Bookmark');
const jwt = require('jsonwebtoken');

// @desc    Get all questions with optional filters and user state
// @route   GET /api/questions
// @access  Public
exports.getQuestions = async (req, res) => {
  try {
    const { role, difficulty, search } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const questions = await Question.find(query).sort({ createdAt: -1 });

    // Optional auth extraction to attach user-specific solve/bookmark status
    let userId = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Continue as unauthenticated guest
      }
    }

    let solvedMap = {};
    let bookmarkSet = new Set();

    if (userId) {
      const answers = await Answer.find({ userId });
      answers.forEach((ans) => {
        solvedMap[ans.questionId.toString()] = ans.score;
      });

      const bookmarks = await Bookmark.find({ userId });
      bookmarks.forEach((bm) => {
        bookmarkSet.add(bm.questionId.toString());
      });
    }

    const formattedQuestions = questions.map((q) => {
      const qObj = q.toObject();
      return {
        ...qObj,
        isSolved: solvedMap[q._id.toString()] !== undefined,
        score: solvedMap[q._id.toString()] || null,
        isBookmarked: bookmarkSet.has(q._id.toString()),
      };
    });

    res.status(200).json({ success: true, count: formattedQuestions.length, data: formattedQuestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Optional auth check for specific user's bookmarked state on this question
    let isBookmarked = false;
    let previousSubmission = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const bookmark = await Bookmark.findOne({ userId, questionId: question._id });
        isBookmarked = !!bookmark;

        previousSubmission = await Answer.findOne({ userId, questionId: question._id }).sort({ createdAt: -1 });
      } catch (err) {
        // Ignore
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...question.toObject(),
        isBookmarked,
        previousSubmission,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a question
// @route   POST /api/questions
// @access  Private/Admin
exports.createQuestion = async (req, res) => {
  try {
    const { title, description, role, difficulty, tags, expectedAnswer, estimatedTime } = req.body;

    if (!title || !description || !role || !difficulty || !expectedAnswer) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const question = await Question.create({
      title,
      description,
      role,
      difficulty,
      tags: tags || [],
      expectedAnswer,
      estimatedTime: estimatedTime || 10,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res) => {
  try {
    const { title, description, role, difficulty, tags, expectedAnswer, estimatedTime } = req.body;

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (title) question.title = title;
    if (description) question.description = description;
    if (role) question.role = role;
    if (difficulty) question.difficulty = difficulty;
    if (tags) question.tags = tags;
    if (expectedAnswer) question.expectedAnswer = expectedAnswer;
    if (estimatedTime) question.estimatedTime = estimatedTime;

    await question.save();

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    await question.deleteOne();

    // Also clean up any answers or bookmarks associated with this question
    await Answer.deleteMany({ questionId: req.params.id });
    await Bookmark.deleteMany({ questionId: req.params.id });

    res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
