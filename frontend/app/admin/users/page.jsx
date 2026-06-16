"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/Toast';
import { formatDateISO } from '../../lib/formatDate';
import fetchClient from '../../lib/fetchClient';

export default function AdminUsers() {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    // 1. Verify admin role from cookie
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user='));
    const userCookie = match ? match.split('=')[1] : null;
    let currentUser = null;
    if (userCookie) {
      try {
        currentUser = JSON.parse(decodeURIComponent(userCookie));
      } catch (e) {
        currentUser = null;
      }
    }

    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Unauthorized access', 'error');
      router.push('/');
      return;
    }

    // 2. Fetch users list
    const fetchUsers = async () => {
      try {
        const data = await fetchClient('/admin/users');
        setUsers(data || []);
      } catch (err) {
        showToast(err.message || 'Failed to fetch user list', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleMakeAdmin = async (id, name) => {
    if (!confirm(`Are you sure you want to make ${name} an Admin?`)) return;

    setActionLoadingId(id);
    try {
      await fetchClient(`/admin/users/${id}/make-admin`, {
        method: 'PATCH',
      });
      showToast(`${name} is now an admin!`, 'success');
      // Update local state
      setUsers(prev =>
        prev.map(u => u._id === id ? { ...u, role: 'admin' } : u)
      );
    } catch (err) {
      showToast(err.message || 'Failed to promote user', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const standardUsersCount = totalUsers - adminCount;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Color options for avatars
  const avatarColors = [
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  ];

  const getColorClass = (email) => {
    // Generate a stable color index based on the email string
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % avatarColors.length;
    return avatarColors[idx];
  };

  if (loading) {
    return (
      <main>
        <div className="text-center py-16">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 text-sm font-semibold">Loading users database...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl my-8 mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white">User Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Manage system roles, view user profile tickets, and monitor user stats.
          </p>
        </div>
      </div>

      {/* Info Tip Box */}
      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150/60 dark:border-indigo-900/20 rounded-xl flex items-start gap-3">
        <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-xs text-indigo-805 dark:text-indigo-300 font-medium leading-relaxed">
          <strong className="font-extrabold block mb-0.5">Quick Guide:</strong>
          Use search to find users by name or email. Click <strong>View Tickets</strong> to view all support requests associated with their account. Promote standard users to admin role using the <strong>Make Admin</strong> button.
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Users</span>
          <p className="text-xl md:text-2xl font-extrabold mt-1 text-slate-800 dark:text-white">{totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-purple-650 dark:text-purple-400 uppercase tracking-wider block font-semibold">Admins</span>
          <p className="text-xl md:text-2xl font-extrabold mt-1 text-purple-750 dark:text-purple-400">{adminCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-450 uppercase tracking-wider block">Standard Users</span>
          <p className="text-xl md:text-2xl font-extrabold mt-1 text-emerald-650 dark:text-emerald-400">{standardUsersCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Filter users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Table/Card Grid Display */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-12 rounded-xl text-center shadow-sm">
          <svg className="w-16 h-16 text-slate-200 dark:text-slate-850 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No users found matching query.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-left">
                  <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</th>
                  <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</th>
                  <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</th>
                  <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Joined</th>
                  <th className="py-3 px-5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-5 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getColorClass(u.email)}`}>
                        {getInitials(u.name)}
                      </div>
                      <span className="text-sm font-semibold text-slate-850 dark:text-slate-200">{u.name}</span>
                    </td>
                    <td className="py-3.5 px-5 text-sm text-slate-500 dark:text-slate-405">{u.email}</td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-400 dark:text-slate-500 font-semibold">{formatDateISO(u.createdAt)}</td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/users/${u._id}/tickets`}
                          className="bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-205 text-xs font-bold py-1.5 px-3 rounded-lg transition-all min-h-[44px] flex items-center"
                        >
                          View Tickets
                        </Link>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleMakeAdmin(u._id, u.name)}
                            disabled={actionLoadingId === u._id}
                            className="bg-purple-600 hover:bg-purple-705 text-white text-xs font-extrabold py-1.5 px-3 rounded-lg disabled:opacity-50 transition-all min-h-[44px]"
                          >
                            {actionLoadingId === u._id ? 'Processing...' : 'Make Admin'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredUsers.map((u) => (
              <div key={u._id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getColorClass(u.email)}`}>
                    {getInitials(u.name)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-white">{u.name}</h4>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">{u.email}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Role</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                      {u.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Date Joined</span>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">{formatDateISO(u.createdAt)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
                  <Link
                    href={`/admin/users/${u._id}/tickets`}
                    className="flex-1 text-center bg-slate-50 border border-slate-200 hover:bg-slate-105 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-205 text-xs font-bold py-2 rounded-lg transition-all min-h-[44px] flex justify-center items-center"
                  >
                    View Tickets
                  </Link>
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleMakeAdmin(u._id, u.name)}
                      disabled={actionLoadingId === u._id}
                      className="flex-1 bg-purple-600 hover:bg-purple-705 text-white text-xs font-extrabold py-2 rounded-lg disabled:opacity-50 transition-all min-h-[44px] justify-center"
                    >
                      {actionLoadingId === u._id ? 'Processing...' : 'Make Admin'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
