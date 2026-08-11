const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per user-question bookmark
bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
