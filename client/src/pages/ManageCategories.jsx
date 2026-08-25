import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFolder,
  FiX,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal settings
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null if adding new
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const loadCategories = async () => {
    try {
      const res = await API.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormError('');
    setFormSuccess('');
    reset({
      name: '',
      description: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormError('');
    setFormSuccess('');
    reset({
      name: cat.name,
      description: cat.description,
    });
    setModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This will not delete questions assigned to this role, but they will no longer appear under this category tab.')) {
      return;
    }
    try {
      const res = await API.delete(`/categories/${id}`);
      if (res.data.success) {
        setCategories((prev) => prev.filter((cat) => cat._id !== id));
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const onSubmit = async (data) => {
    setFormError('');
    setFormSuccess('');
    const payload = {
      name: data.name,
      description: data.description,
    };

    try {
      if (editingCategory) {
        const res = await API.put(`/categories/${editingCategory._id}`, payload);
        if (res.data.success) {
          setFormSuccess('Category updated successfully!');
          setTimeout(() => {
            setModalOpen(false);
            loadCategories();
          }, 1200);
        }
      } else {
        const res = await API.post('/categories', payload);
        if (res.data.success) {
          setFormSuccess('Category created successfully!');
          setTimeout(() => {
            setModalOpen(false);
            loadCategories();
          }, 1200);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred while saving category.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Manage Categories
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Control panel to add new interview job roles, edit descriptions, or remove categories from the registry.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4.5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/15 transition-all shrink-0"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Grid list table */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-2xl shimmer"></div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden">
          {categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <th className="px-6 py-4.5">Category Name</th>
                    <th className="px-6 py-4.5">Generated Slug</th>
                    <th className="px-6 py-4.5">Description</th>
                    <th className="px-6 py-4.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4.5 font-bold text-slate-700">{cat.name}</td>
                      <td className="px-6 py-4.5 font-mono text-xs text-blue-600">/{cat.slug}</td>
                      <td className="px-6 py-4.5 text-slate-500 max-w-sm truncate">{cat.description}</td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-2 text-blue-600 hover:text-blue-500 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                            title="Edit Category details"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="p-2 text-rose-500 hover:text-rose-400 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                            title="Delete Category"
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
              <FiFolder className="w-8 h-8 mx-auto text-slate-400 mb-3" />
              No categories registered. Click "Add New Category" to populate the database.
            </div>
          )}
        </div>
      )}

      {/* CRUD Category Modal */}
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

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl p-6.5 w-full max-w-lg z-10 relative overflow-hidden shadow-xl"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-700 mb-5">
                {editingCategory ? 'Edit Category Role' : 'Add Category Role'}
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

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Category name is required' })}
                    placeholder="e.g. MERN Developer"
                    className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm placeholder-slate-400"
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category Description</label>
                  <textarea
                    {...register('description')}
                    placeholder="Provide details about standard skill topics covered under this interview role..."
                    className="block w-full h-28 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm resize-none placeholder-slate-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-600/10 transition-all"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
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

export default ManageCategories;
