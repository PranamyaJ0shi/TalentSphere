import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiBriefcase
} from 'react-icons/fi';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setSuccess(false);

    const payload = {
      name: data.name,
      email: data.email,
    };

    if (data.newPassword) {
      payload.password = data.newPassword;
    }

    const res = await updateProfile(payload);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      // Clear password fields
      reset({
        name: data.name,
        email: data.email,
        newPassword: '',
        confirmNewPassword: '',
      });
      setTimeout(() => setSuccess(false), 4000);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Account Profile
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Manage your personal details, verify email settings, and keep your password secure.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6.5 border-none"
      >
        {/* Profile Card Header */}
        <div className="flex items-center gap-5 pb-6 mb-6">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=4f46e5&color=fff`}
            alt={user?.name}
            className="w-18 h-18 rounded-2xl object-cover shadow-lg"
          />
          <div>
            <h3 className="text-lg font-bold text-slate-700">{user?.name}</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider block w-max mt-1">
              Account Role: {user?.role}
            </span>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl flex items-center gap-2.5 text-sm">
              <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl flex items-center gap-2.5 text-sm">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FiUser className="w-5 h-5" />
              </div>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" /> {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FiMail className="w-5 h-5" />
              </div>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Heading Divider */}
          <div className="pt-4">
            <h4 className="text-sm font-bold text-slate-700 mb-0.5">Change Password</h4>
            <p className="text-xs text-slate-500">Leave these blank if you do not want to change your password.</p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FiLock className="w-5 h-5" />
              </div>
              <input
                type="password"
                placeholder="Leave blank to keep same"
                {...register('newPassword', {
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
              />
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" /> {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FiLock className="w-5 h-5" />
              </div>
              <input
                type="password"
                placeholder="Confirm new password"
                {...register('confirmNewPassword', {
                  validate: (value) =>
                    !newPassword || value === newPassword || 'New passwords do not match',
                })}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
              />
            </div>
            {errors.confirmNewPassword && (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" /> {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/15 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
