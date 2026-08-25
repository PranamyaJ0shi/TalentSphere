import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiZap,
  FiTarget,
  FiBookmark,
  FiClock,
  FiAward,
  FiArrowRight,
  FiPlay
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get('/analytics/student');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Shimmer header */}
        <div className="h-10 w-1/3 bg-slate-200 rounded-xl shimmer"></div>
        
        {/* Shimmer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-3xl shimmer border border-slate-200"></div>
          ))}
        </div>

        {/* Shimmer Main Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-3xl shimmer border border-slate-200"></div>
          <div className="h-96 bg-slate-100 rounded-3xl shimmer border border-slate-200"></div>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || { solvedCount: 0, streak: 0, accuracy: 0, bookmarkedCount: 0 };
  const recentActivity = data?.recentActivity || [];
  const weeklyProgress = data?.weeklyProgress || [];
  const roleProgress = data?.roleProgress || [];
  const difficultyProgress = data?.difficultyProgress || [];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Easy (Green), Medium (Orange), Hard (Red)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Ready to sharpen your skills? Let's check your interview preparation status today.
          </p>
        </div>
        <Link
          to="/categories"
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all group shrink-0"
        >
          <FiPlay className="w-4 h-4 fill-white" />
          <span>Start Practicing</span>
          <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric: Solved */}
        <div className="glass-card rounded-3xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Questions Solved</span>
            <span className="text-3xl font-black text-slate-800 mt-2 block">{metrics.solvedCount}</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-600">
            <FiCheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric: Streak */}
        <div className="glass-card rounded-3xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Daily Streak</span>
            <span className="text-3xl font-black text-slate-800 mt-2 block">
              {metrics.streak} {metrics.streak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-600">
            <FiZap className="w-6 h-6" />
          </div>
        </div>

        {/* Metric: Accuracy */}
        <div className="glass-card rounded-3xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Avg. Evaluation</span>
            <span className="text-3xl font-black text-slate-800 mt-2 block">{metrics.accuracy}%</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center text-blue-600">
            <FiTarget className="w-6 h-6" />
          </div>
        </div>

        {/* Metric: Bookmarks */}
        <div className="glass-card rounded-3xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Saved Questions</span>
            <span className="text-3xl font-black text-slate-800 mt-2 block">{metrics.bookmarkedCount}</span>
          </div>
          <div className="w-12 h-12 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center justify-center text-cyan-600">
            <FiBookmark className="w-6 h-6" />
          </div>
        </div>
      </motion.div>

      {/* Main Charts & Activity layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Solved Weekly Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FiAward className="text-blue-600 w-5 h-5" /> Weekly Practice Volume
            </h3>
            <p className="text-xs text-slate-500 mt-1">Number of questions submitted daily over the last 7 days.</p>
          </div>
          <div className="w-full h-64 mt-6">
            {weeklyProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ color: '#475569', fontWeight: 'bold' }}
                    itemStyle={{ color: '#1e293b' }}
                  />
                  <Area type="monotone" dataKey="solved" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSolved)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No activity recorded this week yet.</div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Difficulty distribution Pie chart */}
        <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Difficulty Breakdown</h3>
            <p className="text-xs text-slate-500 mt-1">Distribution of questions solved by difficulty level.</p>
          </div>
          <div className="w-full h-52 flex justify-center items-center relative mt-4">
            {metrics.solvedCount > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyProgress}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="solved"
                    >
                      {difficultyProgress.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1e293b' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Score badge at center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800">{metrics.solvedCount}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Solved</span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">Submit answers to unlock levels.</div>
            )}
          </div>
          {/* Legend */}
          <div className="grid grid-cols-3 gap-3 border-t border-slate-200 pt-4 text-center mt-2">
            {difficultyProgress.map((item, idx) => (
              <div key={item.difficulty} className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS[idx] }}>
                  {item.difficulty}
                </span>
                <span className="text-sm font-semibold text-slate-700 mt-0.5">
                  {item.solved}/{item.total}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Grid: Role Progress vs Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Mid Section: Role completion status */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel rounded-3xl p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Topic Progress</h3>
          <div className="space-y-4">
            {roleProgress.slice(0, 5).map((progress) => (
              <div key={progress.role} className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                  <span className="truncate">{progress.role}</span>
                  <span className="text-xs text-blue-600">
                    {progress.solved} / {progress.total} solved ({progress.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {roleProgress.length > 5 && (
              <div className="pt-2 text-center">
                <Link to="/categories" className="text-xs text-blue-600 hover:text-blue-500 font-semibold flex items-center justify-center gap-1">
                  View all categories <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Section: Recent Activity feed */}
        <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
            <p className="text-xs text-slate-500 mt-1">Your latest submission attempts and score outcomes.</p>
          </div>
          <div className="mt-6 flex-grow space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((act) => (
                <div key={act._id} className="flex justify-between items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors">
                  <div className="overflow-hidden">
                    <Link
                      to={`/categories/${act.role.toLowerCase().replace(/\s+/g, '-')}/${act.questionId}`}
                      className="text-sm font-semibold hover:text-blue-600 transition-colors block truncate text-slate-700"
                    >
                      {act.title}
                    </Link>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {act.role} • {new Date(act.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        act.score >= 85
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : act.score >= 50
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}
                    >
                      {act.score}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm py-10">No practice attempts found.</div>
            )}
          </div>
          <div className="pt-4 border-t border-slate-200 mt-4">
            <Link to="/history" className="text-xs text-blue-600 hover:text-blue-500 font-semibold flex items-center justify-center gap-1">
              Browse complete history <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
