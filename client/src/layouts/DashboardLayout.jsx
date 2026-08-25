import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiBookOpen,
  FiClock,
  FiBookmark,
  FiUser,
  FiLogOut,
  FiShield,
  FiDatabase,
  FiUsers,
  FiMenu,
  FiX,
  FiFolder
} from 'react-icons/fi';

const DashboardLayout = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading secure workspace...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiGrid className="w-5 h-5" />, roles: ['student', 'admin'] },
    { name: 'Interview Roles', path: '/categories', icon: <FiBookOpen className="w-5 h-5" />, roles: ['student', 'admin'] },
    { name: 'Practice History', path: '/history', icon: <FiClock className="w-5 h-5" />, roles: ['student', 'admin'] },
    { name: 'Bookmarks', path: '/bookmarks', icon: <FiBookmark className="w-5 h-5" />, roles: ['student', 'admin'] },
    { name: 'My Profile', path: '/profile', icon: <FiUser className="w-5 h-5" />, roles: ['student', 'admin'] },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin', icon: <FiShield className="w-5 h-5" /> },
    { name: 'Manage Questions', path: '/admin/questions', icon: <FiDatabase className="w-5 h-5" /> },
    { name: 'Manage Categories', path: '/admin/categories', icon: <FiFolder className="w-5 h-5" /> },
    { name: 'Users Directory', path: '/admin/users', icon: <FiUsers className="w-5 h-5" /> },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between py-6 px-4">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-extrabold text-xl">TS</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">TalentSphere</h1>
            <p className="text-xs text-blue-600 font-semibold tracking-wider uppercase">AI Platform</p>
          </div>
        </div>

        {/* Navigation links */}
        <div className="space-y-1.5">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Practice Space</p>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'text-white font-medium bg-blue-600 border-l-4 border-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-blue-50'
                }`}
              >
                {link.icon}
                <span className="text-sm">{link.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        {user.role === 'admin' && (
          <div className="mt-8 space-y-1.5">
            <p className="px-3 text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Control Panel</p>
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-white font-medium bg-red-600 border-l-4 border-red-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-red-50'
                  }`}
                >
                  {link.icon}
                  <span className="text-sm">{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="admin-active-indicator"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* User Actions footer */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
            alt={user.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
          />
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate text-slate-800">{user.name}</h4>
            <span className="text-[10px] bg-blue-100 text-blue-700 border border-blue-200 font-bold px-1.5 py-0.5 rounded-md uppercase">
              {user.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 bg-white border-r border-slate-200 z-20 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 border-b border-slate-200 backdrop-blur-md z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">TS</span>
          </div>
          <span className="font-bold text-slate-800">TalentSphere AI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black z-40"
            />
            {/* Sidebar menu panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-white z-50 shadow-2xl shadow-blue-500/10"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame */}
      <main className="flex-grow min-h-screen pt-16 lg:pt-0 overflow-y-auto bg-white relative">
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <div className="max-w-[1400px] mx-auto p-6 md:p-8 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
