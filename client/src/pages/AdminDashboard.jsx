import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiDatabase,
  FiActivity,
  FiTrendingUp,
  FiGrid,
  FiFileText
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/dashboard');
      return;
    }

    const fetchAdminStats = async () => {
      try {
        const res = await API.get('/analytics/admin');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [user, authLoading, navigate]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-1/4 bg-slate-900 rounded-xl shimmer"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-3xl shimmer border border-slate-800/40"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[350px] bg-slate-900 rounded-3xl shimmer border border-slate-800/40"></div>
          <div className="h-[350px] bg-slate-900 rounded-3xl shimmer border border-slate-800/40"></div>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || { totalUsers: 0, totalQuestions: 0, totalSubmissions: 0, avgPlatformAccuracy: 0 };
  const difficultyDistribution = data?.difficultyDistribution || [];
  const monthlyTrends = data?.monthlyTrends || [];
  const roleDistribution = data?.roleDistribution || [];

  const DIFF_COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Easy, Medium, Hard
  const BAR_COLORS = ['#6366f1', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b', '#1e293b'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Platform-wide monitoring of user signups, question counts, and total practice evaluations.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric: Users */}
        <div className="glass-card rounded-3xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Students</span>
            <span className="text-3xl font-black text-slate-100 mt-2 block">{metrics.totalUsers}</span>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center text-indigo-400">
            <FiUsers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric: Questions */}
        <div className="glass-card rounded-3xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Questions</span>
            <span className="text-3xl font-black text-slate-100 mt-2 block">{metrics.totalQuestions}</span>
          </div>
          <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/25 rounded-2xl flex items-center justify-center text-cyan-400">
            <FiDatabase className="w-6 h-6" />
          </div>
        </div>

        {/* Metric: Submissions */}
        <div className="glass-card rounded-3xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Submissions</span>
            <span className="text-3xl font-black text-slate-100 mt-2 block">{metrics.totalSubmissions}</span>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-400">
            <FiActivity className="w-6 h-6" />
          </div>
        </div>

        {/* Metric: Avg Score */}
        <div className="glass-card rounded-3xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Platform Accuracy</span>
            <span className="text-3xl font-black text-slate-100 mt-2 block">{metrics.avgPlatformAccuracy}%</span>
          </div>
          <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/25 rounded-2xl flex items-center justify-center text-pink-400">
            <FiTrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend line chart */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Monthly Registration & Submissions</h3>
            <p className="text-xs text-slate-400 mt-1">Signup rates vs submission volume over the last 6 months.</p>
          </div>
          <div className="w-full h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" name="New Users" dataKey="newUsers" stroke="#8b5cf6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Submissions" dataKey="submissions" stroke="#06b6d4" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roles Distribution Bar Chart */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Questions per Interview Role</h3>
            <p className="text-xs text-slate-400 mt-1">Breakdown of content library across active categories.</p>
          </div>
          <div className="w-full h-64 mt-6">
            {roleDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} interval={0} tickFormatter={(value) => value.substring(0, 12) + '...'} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" name="Questions Count" radius={[4, 4, 0, 0]}>
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No roles registered in library.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Difficulty distributions vs admin options link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Difficulty Pie Chart */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Questions Difficulty Split</h3>
            <p className="text-xs text-slate-400 mt-1">Proportion of easy, medium, and hard content in the system.</p>
          </div>
          <div className="w-full h-52 flex justify-center items-center relative mt-4">
            {metrics.totalQuestions > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {difficultyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DIFF_COLORS[index % DIFF_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No questions in library.</div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-200">{metrics.totalQuestions}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Total</span>
            </div>
          </div>
          {/* Labels */}
          <div className="grid grid-cols-3 gap-3 border-t border-slate-900 pt-4 text-center mt-2 text-xs">
            {difficultyDistribution.map((item, idx) => (
              <div key={item.name} className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: DIFF_COLORS[idx] }}>
                  {item.name}
                </span>
                <span className="text-sm font-semibold text-slate-300 mt-0.5">{item.value} Qs</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Management Shortcuts</h3>
            <p className="text-xs text-slate-400 mt-1">Direct controls to edit database parameters, roles, and questions.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <Link
              to="/admin/questions"
              className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3.5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all group"
            >
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FiDatabase className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-slate-200">Manage Questions</h5>
                <p className="text-xs text-slate-500 mt-0.5">Add, edit, or delete database tasks.</p>
              </div>
            </Link>

            <Link
              to="/admin/categories"
              className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3.5 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group"
            >
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <FiGrid className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-slate-200">Manage Categories</h5>
                <p className="text-xs text-slate-500 mt-0.5">Configure interview domains/categories.</p>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3.5 hover:border-emerald-500/50 hover:bg-slate-900 transition-all group"
            >
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FiUsers className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-slate-200">Users Directory</h5>
                <p className="text-xs text-slate-500 mt-0.5">Browse students & audit solve counts.</p>
              </div>
            </Link>

            <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex items-center gap-3.5 text-slate-500 cursor-not-allowed">
              <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                <FiFileText className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-slate-600">Download Audit Reports</h5>
                <p className="text-xs text-slate-600 mt-0.5">Excel/CSV export logs (Future feature).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
