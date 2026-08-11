const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Bookmark = require('../models/Bookmark');
const Category = require('../models/Category');

// Helper to calculate daily streak
const calculateStreak = (answers) => {
  if (answers.length === 0) return 0;

  // Extract unique local dates (YYYY-MM-DD) sorted descending
  const dates = [
    ...new Set(
      answers.map((a) => {
        const d = new Date(a.createdAt || a.updatedAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    ),
  ].sort((a, b) => new Date(b) - new Date(a));

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // If latest practice isn't today or yesterday, streak is reset
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const curr = new Date(dates[i]);
    const prev = new Date(dates[i + 1]);
    const diffTime = Math.abs(curr - prev);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break;
    }
  }

  return streak;
};

// @desc    Get student stats dashboard
// @route   GET /api/analytics/student
// @access  Private
exports.getStudentAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total questions solved
    const userAnswers = await Answer.find({ userId }).populate('questionId');
    const solvedCount = userAnswers.length;

    // Bookmarked Questions Count
    const bookmarkedCount = await Bookmark.countDocuments({ userId });

    // Practice Streak
    const streak = calculateStreak(userAnswers);

    // Accuracy (Average Score)
    const totalScore = userAnswers.reduce((sum, ans) => sum + ans.score, 0);
    const accuracy = solvedCount > 0 ? Math.round(totalScore / solvedCount) : 0;

    // Recent activity (Last 5 answers)
    const recentActivity = await Answer.find({ userId })
      .populate('questionId', 'title role difficulty')
      .sort({ updatedAt: -1 })
      .limit(5);

    // Role-wise progress (aggregate solved vs total questions per role)
    const categories = await Category.find();
    const roleWiseData = [];

    for (const cat of categories) {
      const totalInRole = await Question.countDocuments({ role: cat.name });
      const solvedInRole = userAnswers.filter((ans) => ans.questionId && ans.questionId.role === cat.name).length;
      roleWiseData.push({
        role: cat.name,
        total: totalInRole,
        solved: solvedInRole,
        percentage: totalInRole > 0 ? Math.round((solvedInRole / totalInRole) * 100) : 0,
      });
    }

    // Difficulty-wise progress
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const difficultyWiseData = [];

    for (const diff of difficulties) {
      const totalInDiff = await Question.countDocuments({ difficulty: diff });
      const solvedInDiff = userAnswers.filter((ans) => ans.questionId && ans.questionId.difficulty === diff).length;
      difficultyWiseData.push({
        difficulty: diff,
        total: totalInDiff,
        solved: solvedInDiff,
        percentage: totalInDiff > 0 ? Math.round((solvedInDiff / totalInDiff) * 100) : 0,
      });
    }

    // Weekly progress (last 7 days submission volume)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const count = await Answer.countDocuments({
        userId,
        updatedAt: { $gte: startOfDay, $lte: endOfDay },
      });

      weeklyData.push({
        day: dayName,
        solved: count,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          solvedCount,
          streak,
          accuracy,
          bookmarkedCount,
        },
        recentActivity: recentActivity.map((act) => ({
          _id: act._id,
          questionId: act.questionId ? act.questionId._id : null,
          title: act.questionId ? act.questionId.title : 'Deleted Question',
          role: act.questionId ? act.questionId.role : 'Unknown',
          difficulty: act.questionId ? act.questionId.difficulty : 'Medium',
          score: act.score,
          date: act.updatedAt,
        })),
        roleProgress: roleWiseData,
        difficultyProgress: difficultyWiseData,
        weeklyProgress: weeklyData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin analytics overview
// @route   GET /api/analytics/admin
// @access  Private/Admin
exports.getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalQuestions = await Question.countDocuments();
    const totalSubmissions = await Answer.countDocuments();

    // Accuracy average across platform
    const allSubmissions = await Answer.find({}, 'score');
    const avgPlatformAccuracy =
      totalSubmissions > 0
        ? Math.round(allSubmissions.reduce((sum, item) => sum + item.score, 0) / totalSubmissions)
        : 0;

    // Difficulty breakdown of questions
    const easyCount = await Question.countDocuments({ difficulty: 'Easy' });
    const mediumCount = await Question.countDocuments({ difficulty: 'Medium' });
    const hardCount = await Question.countDocuments({ difficulty: 'Hard' });

    // Users and Submissions growth trends (last 6 months)
    const monthsData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      
      const startOfMonth = new Date(y, m, 1);
      const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999);

      const usersCount = await User.countDocuments({
        role: 'student',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const submissionsCount = await Answer.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      monthsData.push({
        month: `${monthNames[m]} ${y}`,
        newUsers: usersCount,
        submissions: submissionsCount,
      });
    }

    // Role representation (questions count per role)
    const categories = await Category.find();
    const roleDistribution = [];
    for (const cat of categories) {
      const count = await Question.countDocuments({ role: cat.name });
      roleDistribution.push({
        name: cat.name,
        value: count,
      });
    }

    // List of students with submission counts
    const users = await User.find({ role: 'student' }).sort({ createdAt: -1 });
    const usersList = [];
    for (const u of users) {
      const count = await Answer.countDocuments({ userId: u._id });
      usersList.push({
        id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        submissionsCount: count,
        joinedAt: u.createdAt,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalQuestions,
          totalSubmissions,
          avgPlatformAccuracy,
        },
        difficultyDistribution: [
          { name: 'Easy', value: easyCount },
          { name: 'Medium', value: mediumCount },
          { name: 'Hard', value: hardCount },
        ],
        monthlyTrends: monthsData,
        roleDistribution,
        usersList,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
