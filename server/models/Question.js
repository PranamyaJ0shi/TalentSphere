const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Question description/body is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Question difficulty is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    expectedAnswer: {
      type: String,
      required: [true, 'An expected reference answer is required for AI evaluation'],
      trim: true,
    },
    estimatedTime: {
      type: Number,
      default: 10, // minutes
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Question', questionSchema);
