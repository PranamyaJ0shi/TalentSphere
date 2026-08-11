import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiBookOpen,
  FiCheckCircle,
  FiBookmark,
  FiClock,
  FiChevronRight,
  FiAward
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedDiff, setSelectedDiff] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Load categories & questions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, questRes] = await Promise.all([
          API.get('/categories'),
          API.get('/questions'),
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }
        if (questRes.data.success) {
          setQuestions(questRes.data.data);
        }
      } catch (err) {
        console.error('Error loading categories/questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle bookmark toggling
  const handleToggleBookmark = async (qId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await API.post('/bookmarks', { questionId: qId });
      if (res.data.success) {
        setQuestions((prev) =>
          prev.map((q) =>
            q._id === qId ? { ...q, isBookmarked: res.data.isBookmarked } : q
          )
        );
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  // Filtering Logic
  const filteredQuestions = questions.filter((q) => {
    const matchRole = selectedRole === 'All' || q.role === selectedRole;
    const matchDiff = selectedDiff === 'All' || q.difficulty === selectedDiff;
    const matchSearch =
      searchQuery === '' ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchRole && matchDiff && matchSearch;
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-1/4 bg-slate-900 rounded-xl shimmer"></div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-32 bg-slate-900 rounded-full shimmer shrink-0"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-900 rounded-3xl shimmer border border-slate-800/40"></div>
          ))}
        </div>
      </div>
    );
  }

  // Difficulty badge colors
  const diffStyles = {
    Easy: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
    Hard: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
          Interview Roles & Questions
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Select your target role, search by topics, and start practicing questions to get immediate AI evaluations.
        </p>
      </div>

      {/* Role Selection Horizontal Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Target Role</label>
        <div className="flex gap-2.5 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-thin">
          <button
            onClick={() => setSelectedRole('All')}
            className={`px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 whitespace-nowrap border shrink-0 ${
              selectedRole === 'All'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            All Roles ({questions.length})
          </button>
          {categories.map((cat) => {
            const count = questions.filter((q) => q.role === cat.name).length;
            return (
              <button
                key={cat._id}
                onClick={() => setSelectedRole(cat.name)}
                className={`px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 whitespace-nowrap border shrink-0 ${
                  selectedRole === cat.name
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <FiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by question title, concepts, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <FiFilter className="w-5 h-5" />
          </div>
          <select
            value={selectedDiff}
            onChange={(e) => setSelectedDiff(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="All" className="bg-slate-950">All Difficulties</option>
            <option value="Easy" className="bg-slate-950">Easy</option>
            <option value="Medium" className="bg-slate-950">Medium</option>
            <option value="Hard" className="bg-slate-950">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions Listing */}
      <div className="space-y-4.5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
          <span>Found {filteredQuestions.length} Questions</span>
          <span>Status / Score</span>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredQuestions.length > 0 ? (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => (
                <motion.div
                  key={q._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.3) }}
                  className="group relative bg-slate-900/40 border border-slate-800/50 hover:border-slate-700/60 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/2"
                >
                  <div className="space-y-2.5 overflow-hidden flex-grow">
                    {/* Header: Role & Difficulty */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="bg-slate-950 text-slate-400 font-semibold px-2 py-0.5 rounded-md border border-slate-800/40">
                        {q.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-bold ${diffStyles[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <FiClock className="w-3.5 h-3.5" /> {q.estimatedTime} mins
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                      {q.title}
                    </h3>

                    {/* Description excerpt */}
                    <p className="text-sm text-slate-400 line-clamp-1 max-w-3xl">
                      {q.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {q.tags.map((t) => (
                        <span key={t} className="text-[10px] font-semibold bg-slate-950/80 text-slate-500 px-2 py-0.5 rounded-full border border-slate-800/30">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions / Status Right Side */}
                  <div className="flex items-center gap-4.5 justify-between w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t border-slate-900 md:border-0">
                    <div className="flex items-center gap-3">
                      {/* Solved Status Indicator */}
                      {q.isSolved ? (
                        <div className="flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-xl">
                          <FiCheckCircle className="w-4 h-4" />
                          <span>{q.score}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold px-2">Unsolved</span>
                      )}

                      {/* Bookmark Toggle Icon */}
                      <button
                        onClick={(e) => handleToggleBookmark(q._id, e)}
                        className={`p-2.5 rounded-xl border transition-colors ${
                          q.isBookmarked
                            ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <FiBookmark className={`w-4 h-4 ${q.isBookmarked ? 'fill-cyan-400' : ''}`} />
                      </button>
                    </div>

                    {/* Enter question button */}
                    <Link
                      to={`/categories/${q.role.toLowerCase().replace(/\s+/g, '-')}/${q._id}`}
                      className="flex items-center gap-1 px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-800 hover:border-indigo-500 text-indigo-400 text-xs font-bold rounded-xl transition-all duration-200"
                    >
                      <span>Practice</span>
                      <FiChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl py-14 text-center text-slate-500 text-sm">
              <FiBookOpen className="w-8 h-8 mx-auto text-slate-700 mb-3" />
              No questions found matching the chosen search queries or filters.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Categories;
