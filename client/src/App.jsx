import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import QuestionDetail from './pages/QuestionDetail';
import History from './pages/History';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageQuestions from './pages/ManageQuestions';
import ManageCategories from './pages/ManageCategories';
import AdminUsers from './pages/AdminUsers';

// Error Page
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Layout Workspace */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:role/:id" element={<QuestionDetail />} />
            <Route path="/history" element={<History />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin Specific Workspaces */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/questions" element={<ManageQuestions />} />
            <Route path="/admin/categories" element={<ManageCategories />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          {/* Fallback 404 handler */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
