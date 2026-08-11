import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-center">
      <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/25 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
        <FiAlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-black text-slate-100 font-mono tracking-wider">404</h1>
      <h3 className="text-xl font-bold text-slate-200 mt-3">Workspace Not Found</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
        The workspace path or layout you are trying to visit is restricted or doesn't exist.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/10 transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
