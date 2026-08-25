import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBookmark,
  FiClock,
  FiTrash2,
  FiChevronRight,
  FiAlertCircle,
  FiBookOpen
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await API.get('/bookmarks');
        if (res.data.success) {
          setBookmarks(res.data.data);
        }
      } catch (err) {
        console.error('Error loading bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  // Remove bookmark
  const handleRemoveBookmark = async (qId) => {
    try {
      const res = await API.delete(`/bookmarks/${qId}`);
      if (res.data.success) {
        // Filter out locally
        setBookmarks((prev) => prev.filter((b) => b._id !== qId));
      }
    } catch (err) {
      console.error('Error deleting bookmark:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-1/4 bg-slate-200 rounded-xl shimmer"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl shimmer border border-slate-200"></div>
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
        <h1 className="text-3xl font-extrabold text-slate-800 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Saved Questions
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          A personalized collection of questions you have flagged for revision or future practice.
        </p>
      </div>

      {/* Bookmarks Grid */}
      <AnimatePresence mode="popLayout">
        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarks.map((q, idx) => (
              <motion.div
                key={q._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group bg-white/60 border border-slate-200 hover:border-blue-300 p-5 rounded-3xl flex flex-col justify-between space-y-4 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="space-y-3">
                  {/* Meta items */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200 uppercase">
                      {q.role}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md ${diffStyles[q.difficulty]}`}>
                      {q.difficulty}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <FiClock className="w-3.5 h-3.5" /> {q.estimatedTime} mins
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {q.title}
                  </h3>

                  {/* Description excerpt */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {q.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {q.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <button
                    onClick={() => handleRemoveBookmark(q._id)}
                    className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-50 rounded-xl transition-all"
                    title="Remove Bookmark"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>

                  <Link
                    to={`/categories/${q.role.toLowerCase().replace(/\s+/g, '-')}/${q._id}`}
                    className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
                  >
                    <span>Practice Now</span>
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl py-14 text-center text-slate-500">
            <FiBookmark className="w-8 h-8 mx-auto text-slate-400 mb-3" />
            No saved questions found. Flag questions from the interview list to display them here!
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bookmarks;
