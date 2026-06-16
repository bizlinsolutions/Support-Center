"use client";

import React from 'react';
import Link from 'next/link';
import { getRelativeTimeString } from '../lib/relativeTime';

export default function UserDashboard({ tickets, user }) {
  function priorityBadge(priority) {
    if (priority === 'high') return 'badge-high';
    if (priority === 'medium') return 'badge-medium';
    return 'badge-low';
  }

  const activeTickets = tickets.filter(t => t.status !== 'closed');
  const highPriorityCount = tickets.filter((t) => t.priority === 'high').length;
  const mediumPriorityCount = tickets.filter((t) => t.priority === 'medium').length;
  const lowPriorityCount = tickets.filter((t) => t.priority === 'low').length;

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-slate-900 dark:to-slate-900/40 p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight mb-2">
            Welcome back, <span className="text-primary">{user?.name || 'User'}</span>! 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl font-semibold leading-relaxed">
            Manage and track your support tickets here. You can view existing tickets, check their priority, or file new support requests.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <span className="text-slate-400 dark:text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider block">Total Tickets</span>
          <p className="text-2xl md:text-3xl font-extrabold mt-2 text-slate-800 dark:text-white">{tickets.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <span className="text-red-500 dark:text-red-400 text-[10px] md:text-xs font-bold uppercase tracking-wider block">High Priority</span>
          <p className="text-2xl md:text-3xl font-extrabold mt-2 text-red-650 dark:text-red-400">{highPriorityCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <span className="text-blue-500 dark:text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-wider block">Medium Priority</span>
          <p className="text-2xl md:text-3xl font-extrabold mt-2 text-blue-650 dark:text-blue-400">{mediumPriorityCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <span className="text-emerald-500 dark:text-emerald-400 text-[10px] md:text-xs font-bold uppercase tracking-wider block">Low Priority</span>
          <p className="text-2xl md:text-3xl font-extrabold mt-2 text-emerald-650 dark:text-emerald-400">{lowPriorityCount}</p>
        </div>
      </div>

      {/* Main content: tickets list + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/85 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col min-h-[400px]">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              My Active Tickets ({activeTickets.length})
            </h3>

            {activeTickets.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
                {/* Clean inline SVG illustration */}
                <svg className="w-24 h-24 text-slate-200 dark:text-slate-800 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-4">No active support tickets.</p>
                <Link href="/tickets/create" className="bg-primary text-white font-bold py-2.5 px-4 rounded-lg text-xs hover:bg-primary-hover shadow-sm transition-all min-h-[44px] inline-flex items-center">
                  Create Ticket
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {activeTickets.map((ticket) => (
                  <div key={ticket._id} className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all relative">
                    <Link href={`/tickets/${ticket._id}`} className="block">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight group-hover:text-primary transition-colors min-w-0 flex-1">{ticket.title}</h4>
                        <div className="flex gap-2 items-center flex-shrink-0">
                          <span className={`pill ${ticket.priority}`}>{ticket.priority}</span>
                          <span className={`badge-status-${ticket.status.replace(' ', '-')}`}>{ticket.status}</span>
                        </div>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">{ticket.body}</p>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3.5 flex flex-col sm:flex-row sm:justify-between gap-1 font-semibold">
                        <span>Created {getRelativeTimeString(ticket.createdAt)}</span>
                        <span className="truncate">Assigned to: {ticket.assignedToEmail || 'Unassigned'}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <Link href="/tickets/create" className="w-full bg-primary text-white flex justify-center items-center gap-2 py-3 rounded-lg font-bold shadow-sm hover:bg-primary-hover transition-all cursor-pointer text-xs min-h-[44px]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create New Ticket
            </Link>
            <Link href="/tickets" className="w-full bg-transparent border border-slate-250 dark:border-slate-800 text-slate-750 dark:text-slate-200 flex justify-center items-center gap-2 py-3 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs min-h-[44px]">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              View All Tickets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
