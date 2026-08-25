import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiBookOpen
} from 'react-icons/fi';

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // null if adding new
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  // Load questions and categories
  const loadData = async () => {
    try {
      const [qRes, cRes] = await Promise.all([
        API.get('/questions'),
        API.get('/categories'),
      ]);
      if (qRes.data.success) setQuestions(qRes.data.data);
      if (cRes.data.success) setCategories(cRes.data.data);
    } catch (err) {
      console.error('Error loading questions data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormError('');
    setFormSuccess('');
    reset({
      title: '',
      description: '',
      role: categories[0]?.name || '',
      difficulty: 'Easy',
      tags: '',
      expectedAnswer: '',
      estimatedTime: 10,
    });
    setModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setFormError('');
    setFormSuccess('');
    reset({
      title: q.title,
      description: q.description,
      role: q.role,
      difficulty: q.difficulty,
      tags: q.tags.join(', '),
      expectedAnswer: q.expectedAnswer,
      estimatedTime: q.estimatedTime,
    });
    setModalOpen(true);
  };

  // Delete Question
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this question? This will permanently wipe all associated user submission answers and bookmarks.')) {
      return;
    }
    try {
      const res = await API.delete(`/questions/${id}`);
      if (res.data.success) {
        setQuestions((prev) => prev.filter((q) => q._id !== id));
      }
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  // Submit Add or Edit Form
  const onSubmit = async (data) => {
    setFormError('');
    setFormSuccess('');

    // Format tags array
    const tagsArray = data.tags
      ? data.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : [];

    const payload = {
      title: data.title,
      description: data.description,
      role: data.role,
      difficulty: data.difficulty,
      tags: tagsArray,
      expectedAnswer: data.expectedAnswer,
      estimatedTime: Number(data.estimatedTime),
    };

    try {
      if (editingQuestion) {
        // Edit API call
        const res = await API.put(`/questions/${editingQuestion._id}`, payload);
        if (res.data.success) {
          setFormSuccess('Question updated successfully!');
          setTimeout(() => {
            setModalOpen(false);
            loadData();
          }, 1200);
        }
      } else {
        // Add API call
        const res = await API.post('/questions', payload);
        if (res.data.success) {
          setFormSuccess('Question created successfully!');
          setTimeout(() => {
            setModalOpen(false);
            loadData();
          }, 1200);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred while saving question parameters.');
    }
  };

  // Filtered list
  const filteredQuestions = questions.filter((q) => {
    const matchRole = roleFilter === 'All' || q.role === roleFilter;
    const matchSearch =
      searchQuery === '' ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchRole && matchSearch;
  });

  const diffStyles = {
    Easy: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    Medium: 'bg-amber-50 text-amber-600 border border-amber-200',
    Hard: 'bg-rose-50 text-rose-600 border border-rose-200',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Manage Questions
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Widescreen control panel to review, create, edit, or delete technical questions from the database.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4.5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/15 transition-all shrink-0"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <FiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search questions by title, concepts, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name} className="bg-white">
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid List layout */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-2xl shimmer"></div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden">
          {filteredQuestions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <th className="px-6 py-4.5">Title</th>
                    <th className="px-6 py-4.5">Target Role</th>
                    <th className="px-6 py-4.5">Difficulty</th>
                    <th className="px-6 py-4.5">Time</th>
                    <th className="px-6 py-4.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredQuestions.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4.5">
                        <div className="font-bold text-slate-700 max-w-sm truncate">{q.title}</div>
                        <div className="flex gap-1 mt-1">
                          {q.tags.slice(0, 3).map((t) => (
                            <span key={t} className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-md font-semibold">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 font-semibold">{q.role}</td>
                      <td className="px-6 py-4.5">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${diffStyles[q.difficulty]}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 font-mono text-xs">{q.estimatedTime} mins</td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(q)}
                            className="p-2 text-blue-600 hover:text-blue-500 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                            title="Edit question parameters"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q._id)}
                            className="p-2 text-rose-500 hover:text-rose-400 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                            title="Delete question permanently"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-14 text-center text-slate-500">
              <FiBookOpen className="w-8 h-8 mx-auto text-slate-400 mb-3" />
              No questions found. Click "Add New Question" to populate the database.
            </div>
          )}
        </div>
      )}

      {/* CRUD Overlay Form Modal (Animated) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl p-6.5 w-full max-w-2xl z-10 relative overflow-hidden shadow-xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-700 mb-5 flex items-center gap-2">
                {editingQuestion ? 'Edit Interview Question' : 'Add Interview Question'}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {formSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                    <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}
                {formError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                    <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Question Title</label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    placeholder="e.g. Explain JavaScript Promises and async/await syntax"
                    className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm placeholder-slate-400"
                  />
                  {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category Role Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Target Interview Role</label>
                    <select
                      {...register('role', { required: 'Role is required' })}
                      className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm appearance-none cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name} className="bg-white">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Difficulty</label>
                    <select
                      {...register('difficulty')}
                      className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm appearance-none cursor-pointer"
                    >
                      <option value="Easy" className="bg-white">Easy</option>
                      <option value="Medium" className="bg-white">Medium</option>
                      <option value="Hard" className="bg-white">Hard</option>
                    </select>
                  </div>

                  {/* Est Time */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Est. Duration (Mins)</label>
                    <input
                      type="number"
                      {...register('estimatedTime', { required: 'Time limit required', min: 1 })}
                      className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Detailed Question Description</label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    placeholder="Provide additional details, code snippets, or prompt requirements here..."
                    className="block w-full h-24 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm resize-none placeholder-slate-400"
                  />
                  {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description.message}</p>}
                </div>

                {/* Expected Reference Answer */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Expected Reference Answer (for AI Evaluator)</label>
                  <textarea
                    {...register('expectedAnswer', { required: 'Reference answer is required' })}
                    placeholder="Write down the key concepts, phrases, vocabulary, and explanation summary expected in student submissions..."
                    className="block w-full h-28 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm resize-none placeholder-slate-400"
                  />
                  {errors.expectedAnswer && <p className="mt-1 text-xs text-rose-400">{errors.expectedAnswer.message}</p>}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    {...register('tags')}
                    placeholder="JavaScript, Promises, Async-Await, WebDev"
                    className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm placeholder-slate-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-600/10 transition-all"
                  >
                    {editingQuestion ? 'Update Question Database' : 'Add Question Database'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageQuestions;
