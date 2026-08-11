import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiAward,
  FiFilter,
  FiCheckCircle,
  FiAlertCircle,
  FiBookOpen,
  FiArrowRight
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/history');
        if (res.data.success) {
          setHistory(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Extract unique roles from history to filter dynamically
  const uniqueRoles = ['All', ...new Set(history.map((h) => h.role))];

  // Filter History
  const filteredHistory = history.filter((h) => {
    const matchRole = roleFilter === 'All' || h.role === roleFilter;
    const matchDiff = diffFilter === 'All' || h.difficulty === diffFilter;
    return matchRole && matchDiff;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-1/4 bg-slate-900 rounded-xl shimmer"></div>
        <div className="h-12 bg-slate-900 rounded-2xl shimmer"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-900 rounded-2xl shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

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
          Practice History
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Review your past practice sessions, read detailed AI feedback, and monitor your score improvements.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/40 border border-slate-900 p-4 rounded-2xl">
        <div className="flex-grow flex gap-2 items-center text-slate-500 text-xs uppercase font-bold px-2">
          <FiFilter className="w-4 h-4 text-indigo-400" />
          <span>Filter History</span>
        </div>
        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold rounded-xl text-slate-300 appearance-none cursor-pointer"
        >
          {uniqueRoles.map((role) => (
            <option key={role} value={role}>
              {role === 'All' ? 'All Roles' : role}
            </option>
          ))}
        </select>
        {/* Difficulty Filter */}
        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          className="px-4 py-2 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold rounded-xl text-slate-300 appearance-none cursor-pointer"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* History List Table */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        {filteredHistory.length > 0 ? (
          <div className="divide-y divide-slate-900">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/30 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="col-span-2">Date</span>
              <span className="col-span-3">Question</span>
              <span className="col-span-3">Role</span>
              <span className="col-span-2">Difficulty</span>
              <span className="col-span-1 text-center">Score</span>
              <span className="col-span-1"></span>
            </div>

            {/* Submissions rows */}
            {filteredHistory.map((item) => {
              const isExpanded = expandedId === item._id;
              const localDate = new Date(item.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div key={item._id} className="transition-colors hover:bg-slate-900/20">
                  <div
                    onClick={() => toggleExpand(item._id)}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4.5 items-center cursor-pointer text-sm"
                  >
                    {/* Date */}
                    <div className="col-span-2 text-slate-400 font-semibold flex items-center gap-1.5 md:block text-xs md:text-sm">
                      <FiClock className="w-4 h-4 text-slate-500 md:hidden" />
                      <span>{localDate}</span>
                    </div>

                    {/* Question title */}
                    <div className="col-span-3 font-bold text-slate-200 truncate pr-4">
                      {item.question}
                    </div>

                    {/* Role */}
                    <div className="col-span-3 text-slate-400">
                      <span className="md:hidden text-xs text-slate-500 uppercase font-semibold mr-1">Role:</span>
                      {item.role}
                    </div>

                    {/* Difficulty */}
                    <div className="col-span-2">
                      <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${diffStyles[item.difficulty]}`}>
                        {item.difficulty}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="col-span-1 text-center md:text-center flex md:block items-center justify-between mt-2 md:mt-0">
                      <span className="md:hidden text-xs text-slate-500 uppercase font-semibold">Score:</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          item.score >= 85
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.score >= 50
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {item.score}%
                      </span>
                    </div>

                    {/* Expand Trigger Icon */}
                    <div className="col-span-1 flex justify-end">
                      <button className="p-1 text-slate-500 hover:text-slate-300">
                        {isExpanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Accordion Panel */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 bg-slate-950/50 border-t border-slate-900/60 grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                          {/* Answer submitted */}
                          <div className="space-y-2">
                            <h5 className="font-bold text-slate-400 uppercase tracking-wider text-xs">Your Submitted Answer</h5>
                            <div className="bg-slate-950 border border-slate-900 p-4.5 rounded-2xl font-mono text-xs text-slate-300 leading-relaxed h-64 overflow-y-auto whitespace-pre-wrap">
                              {item.submittedAnswer}
                            </div>
                          </div>

                          {/* AI Evaluation */}
                          <div className="space-y-2">
                            <h5 className="font-bold text-indigo-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                              <FiAward className="w-4 h-4" /> AI Grading Review
                            </h5>
                            <div className="bg-slate-950 border border-indigo-950/20 p-4.5 rounded-2xl text-slate-300 leading-relaxed h-64 overflow-y-auto">
                              {item.feedback.split('\n\n').map((block, i) => {
                                if (block.startsWith('### ')) {
                                  return <h4 key={i} className="text-xs font-bold text-slate-200 mt-2 border-b border-slate-900 pb-1">{block.replace('### ', '')}</h4>;
                                }
                                if (block.startsWith('#### ')) {
                                  return <h5 key={i} className="text-xs font-bold text-slate-400 mt-2">{block.replace('#### ', '')}</h5>;
                                }
                                if (block.includes(' - [')) {
                                  return (
                                    <ul key={i} className="space-y-1 my-1">
                                      {block.split('\n').map((line, j) => {
                                        const isChecked = line.includes('[x]');
                                        return (
                                          <li key={j} className="flex items-center gap-1.5 text-xs text-slate-400">
                                            {isChecked ? <FiCheckCircle className="text-indigo-400 w-3.5 h-3.5" /> : <FiAlertCircle className="text-slate-600 w-3.5 h-3.5" />}
                                            <span>{line.replace(/ - \[[x\s]\]\s*/g, '')}</span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  );
                                }
                                return <p key={i} className="text-xs text-slate-400 mt-1">{block}</p>;
                              })}

                              {/* Link to Retry */}
                              {item.questionId && (
                                <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center">
                                  <span className="text-[10px] text-slate-500">Need to improve score?</span>
                                  <Link
                                    to={`/categories/${item.role.toLowerCase().replace(/\s+/g, '-')}/${item.questionId}`}
                                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-white font-bold"
                                  >
                                    <span>Retry Question</span>
                                    <FiArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-14 text-center text-slate-500">
            <FiBookOpen className="w-8 h-8 mx-auto text-slate-700 mb-3" />
            No practice submissions found in history. Start practicing questions to log stats!
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
