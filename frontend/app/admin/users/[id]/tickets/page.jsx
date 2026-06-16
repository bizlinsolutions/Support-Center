"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '../../../../components/Toast';
import { getRelativeTimeString } from '../../../../lib/relativeTime';
import fetchClient from '../../../../lib/fetchClient';

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

    // 2. Fetch user details and their tickets
    const fetchData = async () => {
      try {
        // Fetch all users to find this user
        const usersList = await fetchClient('/admin/users');
        const foundUser = usersList.find(u => u._id === id);
        
        if (!foundUser) {
          showToast('User not found', 'error');
          router.push('/admin/users');
          return;
        }
        setUser(foundUser);

        // Fetch all tickets to filter for this user
        const ticketsData = await fetchClient('/admin/tickets?limit=500');
        const userTickets = (ticketsData.tickets || []).filter(t => t.user_email === foundUser.email);
        setTickets(userTickets);
      } catch (err) {
        showToast(err.message || 'Failed to fetch user ticket data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  function priorityBadge(priority) {
    if (priority === 'high') return 'badge-high';
    if (priority === 'medium') return 'badge-medium';
    return 'badge-low';
  }

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
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 text-sm font-semibold">Loading user's support records...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl my-8 mx-auto px-4 space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/admin/users" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 min-h-[44px]">
          ← Back to Users Directory
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-850 dark:text-white leading-none">{user?.name}</h2>
              <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${user?.role === 'admin'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                {user?.role}
              </span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-semibold mt-1.5">{user?.email}</p>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-4 text-center">
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 px-4 py-2 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
            <p className="text-base font-extrabold text-slate-700 dark:text-slate-205">{tickets.length}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-100/40 dark:border-yellow-900/10 px-4 py-2 rounded-xl">
            <span className="text-[10px] text-yellow-650 dark:text-yellow-400 font-bold uppercase tracking-wider">Open</span>
            <p className="text-base font-extrabold text-yellow-750 dark:text-yellow-350">{openCount}</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-900/10 px-4 py-2 rounded-xl">
            <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider">In Progress</span>
            <p className="text-base font-extrabold text-indigo-750 dark:text-indigo-350">{inProgressCount}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100/40 dark:border-emerald-900/10 px-4 py-2 rounded-xl">
            <span className="text-[10px] text-emerald-650 dark:text-emerald-400 font-bold uppercase tracking-wider">Closed</span>
            <p className="text-base font-extrabold text-emerald-750 dark:text-emerald-350">{closedCount}</p>
          </div>
        </div>
      </div>

      {/* Ticket List Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          Support Tickets
        </h3>

        {tickets.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-12 rounded-2xl text-center shadow-sm">
            <svg className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">This user hasn't submitted any support tickets yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
                <Link href={`/tickets/${ticket._id}`} className="block space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-sm font-bold text-slate-850 dark:text-white truncate group-hover:text-primary transition-colors">
                      {ticket.title}
                    </h4>
                    <div className="flex gap-2 items-center flex-shrink-0">
                      <span className={priorityBadge(ticket.priority)}>
                        {ticket.priority}
                      </span>
                      <span className={`badge-status-${ticket.status.replace(' ', '-')}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {ticket.body}
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 dark:text-slate-500 flex justify-between font-semibold">
                    <span>Submitted {getRelativeTimeString(ticket.createdAt)}</span>
                    <span>Assigned: {ticket.assignedToEmail || 'Unassigned'}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
