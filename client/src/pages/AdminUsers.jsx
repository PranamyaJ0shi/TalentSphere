import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { FiUsers, FiClock, FiActivity, FiBookOpen } from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/analytics/admin');
        if (res.data.success) {
          setUsers(res.data.data.usersList || []);
        }
      } catch (err) {
        console.error('Error loading users list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-1/4 bg-slate-200 rounded-xl shimmer"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Users Directory
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Browse students registered on the platform, audit their active question submissions, and see when they joined.
        </p>
      </div>

      {/* Users directory panel */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="px-6 py-4.5">Student</th>
                  <th className="px-6 py-4.5">Email Address</th>
                  <th className="px-6 py-4.5 text-center">Questions Answered</th>
                  <th className="px-6 py-4.5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u) => {
                  const joinDate = new Date(u.joinedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name Card */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=4f46e5&color=fff`}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow"
                        />
                        <span className="font-bold text-slate-700">{u.name}</span>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-slate-500">{u.email}</td>

                      {/* Total submissions */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-xl">
                          <FiActivity className="w-3.5 h-3.5" />
                          <span>{u.submissionsCount} submissions</span>
                        </span>
                      </td>

                      {/* Join Date */}
                      <td className="px-6 py-4 text-slate-500 font-semibold">
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <FiClock className="w-4 h-4" />
                          <span>{joinDate}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center text-slate-500">
            <FiUsers className="w-8 h-8 mx-auto text-slate-400 mb-3" />
            No student accounts registered on the platform.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
