"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '../../../../components/Toast';
import { getRelativeTimeString } from '../../../../lib/relativeTime';
import fetchClient from '../../../../lib/fetchClient';
import { formatDateISO } from '../../../../lib/formatDate';

export default function UserTicketsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

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

    // 2. Fetch user details and their tickets via dedicated endpoint
    const fetchData = async () => {
      try {
        const data = await fetchClient(`/admin/users/${id}/tickets`);
        setUser(data.user);
        setTickets(data.tickets || []);
      } catch (err) {
        showToast(err.message || 'Failed to fetch user ticket data', 'error');
        router.push('/admin/users');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in progress').length;
  const closedCount = tickets.filter(t => t.status === 'closed').length;

  if (loading) {
    return (
      <main>
        <div className="text-center py-16">
          <svg className="animate-spin h-6 w-6 text-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 text-[13px] font-semibold">Loading user's support records...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl my-8 mx-auto px-4 space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/admin/users" className="text-[13px] font-bold text-primary hover:underline flex items-center gap-1">
          ← Back to Users Directory
        </Link>
      </div>

      {/* Profile Header */}
      <div className="card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-lg flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-none">{user?.name}</h2>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${user?.role === 'admin' ? 'text-primary' : 'text-slate-500'}`}>
                {user?.role}
              </span>
            </div>
            <p className="text-slate-500 text-[13px] font-medium mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-4 text-center">
          <div className="bg-background border border-border-color px-3 py-2 rounded">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{tickets.length}</p>
          </div>
          <div className="bg-background border border-border-color px-3 py-2 rounded">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Open</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{openCount}</p>
          </div>
          <div className="bg-background border border-border-color px-3 py-2 rounded">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">In Progress</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{inProgressCount}</p>
          </div>
          <div className="bg-background border border-border-color px-3 py-2 rounded">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Closed</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{closedCount}</p>
          </div>
        </div>
      </div>

      {/* Ticket List Section */}
      <div className="space-y-4">
        <h3 className="text-[13px] font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wider">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          Support Tickets
        </h3>

        {tickets.length === 0 ? (
          <div className="card text-center py-12">
            <p className="empty-state-text font-semibold text-[13px]">This user hasn't submitted any support tickets yet.</p>
          </div>
        ) : (
          <div className="table-card">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="table-header-row">
                            <th className="table-header-cell">ID</th>
                            <th className="table-header-cell w-1/2">Subject</th>
                            <th className="table-header-cell">Priority</th>
                            <th className="table-header-cell">Status</th>
                            <th className="table-header-cell">Agent</th>
                            <th className="table-header-cell-right">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr key={ticket.publicId} className="table-row group">
                                <td className="table-cell font-bold text-slate-500 whitespace-nowrap">
                                    <Link href={`/tickets/${ticket.publicId}`} className="hover:text-primary transition-none">
                                        #{ticket.publicId}
                                    </Link>
                                </td>
                                <td className="table-cell">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ticket.priority === 'high' ? 'bg-rose-500' : ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                        <Link href={`/tickets/${ticket.publicId}`} className="font-bold text-slate-800 dark:text-slate-200 hover:text-primary transition-none line-clamp-1">
                                            {ticket.title}
                                        </Link>
                                    </div>
                                </td>
                                <td className="table-cell whitespace-nowrap">
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${ticket.priority === 'high' ? 'text-rose-600' : ticket.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td className="table-cell whitespace-nowrap">
                                    <span className={`badge badge-status-${ticket.status.replace(' ', '-')}`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="table-cell font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                    {ticket.assignedToEmail || <span className="text-slate-400 italic font-normal">Unassigned</span>}
                                </td>
                                <td className="table-cell-right text-slate-500 whitespace-nowrap">
                                    {formatDateISO(ticket.createdAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        )}
      </div>
    </main>
  );
}
