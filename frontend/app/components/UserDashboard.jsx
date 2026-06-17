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
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-1">
            Customer Portal
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
            Welcome, <span className="text-primary">{user?.name || 'User'}</span>. Track your requests and get support.
          </p>
        </div>
        <div className="relative z-10">
          <Link href="/tickets/create" className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-xs hover:bg-primary-hover shadow-sm transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create Ticket
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Tickets</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{tickets.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">High Priority</p>
            <p className="text-2xl font-extrabold text-red-600 dark:text-red-500">{highPriorityCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Medium Priority</p>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-500">{mediumPriorityCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Low Priority</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-500">{lowPriorityCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>
      </div>

      {/* Main content: tickets list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            My Active Tickets
          </h3>
          <Link href="/tickets" className="text-xs font-bold text-primary hover:underline">View All</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Ticket ID</th>
                <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/2">Subject</th>
                <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {activeTickets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <p className="text-sm text-slate-500 font-semibold mb-3">You have no active support tickets.</p>
                    <Link href="/tickets/create" className="inline-block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                      Create a Ticket
                    </Link>
                  </td>
                </tr>
              ) : (
                activeTickets.map((ticket) => (
                  <tr key={ticket.publicId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-5 text-xs font-bold text-slate-500 whitespace-nowrap">
                      <Link href={`/tickets/${ticket.publicId}`} className="hover:text-primary transition-colors">
                        #{ticket.publicId}
                      </Link>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ticket.priority === 'high' ? 'bg-red-500' : ticket.priority === 'medium' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                        <Link href={`/tickets/${ticket.publicId}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-primary transition-colors line-clamp-1">
                          {ticket.title}
                        </Link>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`badge-status-${ticket.status.replace(' ', '-')}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 text-right whitespace-nowrap">
                      {getRelativeTimeString(ticket.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
