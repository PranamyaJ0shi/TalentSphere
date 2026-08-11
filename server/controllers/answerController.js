const Answer = require('../models/Answer');
const Question = require('../models/Question');
const { evaluateAnswer } = require('../utils/evaluator');

// @desc    Submit an answer
// @route   POST /api/answers
// @access  Private
exports.submitAnswer = async (req, res) => {
  try {
    const { questionId, answer } = req.body;

    if (!questionId || !answer) {
      return res.status(400).json({ success: false, message: 'Question ID and answer content are required' });
    }

    // Find question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Evaluate answer using the smart evaluator helper
    const { score, feedback } = evaluateAnswer(answer, question.expectedAnswer);

    // Save submission (either create new or overwrite previous submission for this question to keep clean stats)
    let submission = await Answer.findOne({ userId: req.user.id, questionId });

    if (submission) {
      submission.answer = answer;
      submission.score = score;
      submission.feedback = feedback;
      await submission.save();
    } else {
      submission = await Answer.create({
        userId: req.user.id,
        questionId,
        answer,
        score,
        feedback,
      });
    }

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's answers summary
// @route   GET /api/answers/me
// @access  Private
exports.getMyAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: answers.length, data: answers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed submission history
// @route   GET /api/history
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const history = await Answer.find({ userId: req.user.id })
      .populate('questionId', 'title role difficulty expectedAnswer')
      .sort({ updatedAt: -1 });

    const formattedHistory = history.map((h) => ({
      _id: h._id,
      date: h.updatedAt || h.createdAt,
      role: h.questionId ? h.questionId.role : 'Unknown Role',
      difficulty: h.questionId ? h.questionId.difficulty : 'Medium',
      questionId: h.questionId ? h.questionId._id : null,
      question: h.questionId ? h.questionId.title : 'Deleted Question',
      submittedAnswer: h.answer,
      score: h.score,
      feedback: h.feedback,
      expectedAnswer: h.questionId ? h.questionId.expectedAnswer : '',
    }));

    res.status(200).json({ success: true, count: formattedHistory.length, data: formattedHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
