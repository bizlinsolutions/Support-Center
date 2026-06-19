"use client";

import React from 'react';
import Link from 'next/link';
import { getRelativeTimeString } from '../lib/relativeTime';

export default function UserDashboard({ tickets, user }) {
  const activeTickets = tickets.filter(t => t.status !== 'closed');
  const highPriorityCount = tickets.filter((t) => t.priority === 'high').length;
  const mediumPriorityCount = tickets.filter((t) => t.priority === 'medium').length;
  const lowPriorityCount = tickets.filter((t) => t.priority === 'low').length;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="dashboard-welcome-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="dashboard-title mb-1">
            Customer Portal
          </h2>
          <p className="dashboard-subtitle">
            Welcome, <span className="text-primary font-bold">{user?.name || 'User'}</span>. Track your requests and get support.
          </p>
        </div>
        <div>
          <Link href="/tickets/create" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            Create Ticket
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card-label">Total Tickets</span>
          <span className="stat-card-value">{tickets.length}</span>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 5H7v14h10V7h-2M9 5v2h2V5M9 5h2m-3 7h3m-3 4h3" /></svg>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">High Priority</span>
          <span className="stat-card-value">{highPriorityCount}</span>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Medium Priority</span>
          <span className="stat-card-value">{mediumPriorityCount}</span>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Low Priority</span>
          <span className="stat-card-value">{lowPriorityCount}</span>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
        </div>
      </div>

      {/* Main content: tickets list */}
      <div className="table-card">
        <div className="px-4 py-3 border-b border-border-color bg-background flex justify-between items-center">
          <h3 className="text-[13px] font-bold">
            My Active Tickets
          </h3>
          <Link href="/tickets" className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider">View All</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header-row">
                <th className="table-header-cell">Ticket ID</th>
                <th className="table-header-cell w-1/2">Subject</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell-right">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {activeTickets.length === 0 ? (
                <tr className="table-row">
                  <td colSpan="4" className="py-12 text-center">
                    <p className="empty-state-text mb-3 font-semibold">You have no active support tickets.</p>
                    <Link href="/tickets/create" className="btn-outline inline-flex">
                      Create a Ticket
                    </Link>
                  </td>
                </tr>
              ) : (
                activeTickets.map((ticket) => (
                  <tr key={ticket.publicId} className="table-row hover:bg-background transition-colors group">
                    <td className="table-cell font-bold text-slate-500 whitespace-nowrap">
                      <Link href={`/tickets/${ticket.publicId}`} className="hover:text-primary transition-colors">
                        #{ticket.publicId}
                      </Link>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ticket.priority === 'high' ? 'bg-red-500' : ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                        <Link href={`/tickets/${ticket.publicId}`} className="font-bold text-slate-800 dark:text-slate-200 hover:text-primary transition-colors line-clamp-1">
                          {ticket.title}
                        </Link>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge badge-status-${ticket.status.replace(' ', '-')}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="table-cell-right whitespace-nowrap text-slate-500">
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
