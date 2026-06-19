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
        prev.map(u => u.publicId === id ? { ...u, role: 'admin' } : u)
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

  if (loading) {
    return (
      <main>
        <div className="text-center py-16">
          <svg className="animate-spin h-6 w-6 text-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 text-[13px] font-semibold">Loading users database...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl my-8 mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">User Management</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            Manage system roles, view user profile tickets, and monitor user stats.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalUsers}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admins</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{adminCount}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Standard Users</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{standardUsersCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex card p-3">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Filter users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-background border border-border-color rounded text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary transition-none"
          />
        </div>
      </div>

      {/* Table Display */}
      {filteredUsers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="empty-state-text font-semibold text-[13px]">No users found matching query.</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="table-header-row">
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Email</th>
                  <th className="table-header-cell">Role</th>
                  <th className="table-header-cell">Date Joined</th>
                  <th className="table-header-cell-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.publicId} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-sm bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[11px] text-slate-600 dark:text-slate-300">
                          {getInitials(u.name)}
                        </div>
                        <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{u.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-slate-500 dark:text-slate-400">{u.email}</td>
                    <td className="table-cell">
                      {u.role === 'admin' ? (
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Admin</span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</span>
                      )}
                    </td>
                    <td className="table-cell text-slate-500">{formatDateISO(u.createdAt)}</td>
                    <td className="table-cell-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/users/${u.publicId}/tickets`}
                          className="btn-outline text-[11px] px-2 py-1"
                        >
                          Tickets
                        </Link>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleMakeAdmin(u.publicId, u.name)}
                            disabled={actionLoadingId === u.publicId}
                            className="btn-primary text-[11px] px-2 py-1"
                          >
                            {actionLoadingId === u.publicId ? '...' : 'Make Admin'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
