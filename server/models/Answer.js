const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer content is required'],
      trim: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Answer', answerSchema);
