"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from './Toast';
import { getRelativeTimeString } from '../lib/relativeTime';
import fetchClient from '../lib/fetchClient';

export default function AdminDashboard({ tickets, users, currentUser }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  const activeTickets = tickets.filter(t => t.status !== 'closed');
  const agents = users.filter(u => u.role === 'admin');

  // Stats calculation
  const totalTickets = tickets.length;
  const activeUsersCount = users.length;
  const adminsCount = agents.length;
  const highPriorityCount = tickets.filter(t => t.priority === 'high').length;
  const mediumPriorityCount = tickets.filter(t => t.priority === 'medium').length;
  const lowPriorityCount = tickets.filter(t => t.priority === 'low').length;

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in progress').length;
  const closedCount = tickets.filter(t => t.status === 'closed').length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(activeTickets.map(t => t.publicId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (status) => {
    if (!status || selectedIds.length === 0) return;
    setIsBulkOperating(true);
    showToast(`Updating status of ${selectedIds.length} tickets...`, 'info');

    try {
      await Promise.all(
        selectedIds.map(id =>
          fetchClient(`/tickets/${id}/status`, {
            method: 'PATCH',
            data: { status }
          })
        )
      );
      showToast(`Successfully updated ${selectedIds.length} tickets to ${status}.`, 'success');
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      showToast(err.message || 'Failed to perform bulk status update', 'error');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkAssign = async (agentEmail) => {
    if (!agentEmail || selectedIds.length === 0) return;
    setIsBulkOperating(true);
    const email = agentEmail === 'unassign' ? null : agentEmail;
    showToast(`Assigning agent to ${selectedIds.length} tickets...`, 'info');

    try {
      await Promise.all(
        selectedIds.map(id =>
          fetchClient(`/tickets/${id}/assign`, {
            method: 'PATCH',
            data: { assignedToEmail: email }
          })
        )
      );
      showToast(`Successfully assigned agent to ${selectedIds.length} tickets.`, 'success');
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      showToast(err.message || 'Failed to perform bulk assignment', 'error');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} tickets? This action is permanent.`)) return;

    setIsBulkOperating(true);
    showToast(`Deleting ${selectedIds.length} tickets...`, 'info');

    try {
      await Promise.all(
        selectedIds.map(id =>
          fetchClient(`/tickets/${id}`, {
            method: 'DELETE'
          })
        )
      );
      showToast(`Successfully deleted ${selectedIds.length} tickets.`, 'success');
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete tickets', 'error');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const [currentView, setCurrentView] = useState('All Active');

  const getFilteredTickets = () => {
    switch (currentView) {
      case 'Open': return activeTickets.filter(t => t.status === 'open');
      case 'In Progress': return activeTickets.filter(t => t.status === 'in progress');
      case 'High Priority': return activeTickets.filter(t => t.priority === 'high');
      case 'Unassigned': return activeTickets.filter(t => !t.assignedToEmail);
      case 'All Active':
      default: return activeTickets;
    }
  };

  const displayedTickets = getFilteredTickets();

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card-label">Total Active</span>
          <span className="stat-card-value">{activeTickets.length}</span>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 5H7v14h10V7h-2M9 5v2h2V5M9 5h2m-3 7h3m-3 4h3" /></svg>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Open</span>
          <span className="stat-card-value">{openCount}</span>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">High Priority</span>
          <span className="stat-card-value">{highPriorityCount}</span>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Agents</span>
          <span className="stat-card-value">{adminsCount}</span>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
      </div>

      {/* Main Dashboard Layout (Sidebar + Table) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Views Sidebar */}
        <div className="w-full lg:w-48 flex-shrink-0 border border-border-color bg-card-bg rounded-md py-2 space-y-0.5">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-3 pt-2">Views</h3>
          {['All Active', 'Open', 'In Progress', 'Unassigned', 'High Priority'].map(view => (
            <button
              key={view}
              onClick={() => { setCurrentView(view); setSelectedIds([]); }}
              className={`w-full text-left px-3 py-1.5 text-[13px] font-semibold transition-none flex items-center justify-between border-l-2 ${
                currentView === view 
                  ? 'border-primary bg-background text-primary' 
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-background'
              }`}
            >
              <span>{view}</span>
            </button>
          ))}
        </div>

        {/* Right High-Density Table */}
        <div className="flex-1 w-full table-card">
          {/* Table Toolbar */}
          <div className="px-4 py-3 border-b border-border-color bg-background flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-[13px] font-bold">{currentView} Tickets ({displayedTickets.length})</h3>
            
            {/* Bulk Actions visible only when tickets selected */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => handleBulkStatus(e.target.value)}
                  disabled={isBulkOperating}
                  className="text-[11px] bg-white dark:bg-slate-900 border border-border-color rounded px-2 py-1 focus:ring-1 focus:ring-primary font-semibold m-0 w-auto"
                  defaultValue=""
                >
                  <option value="" disabled>Status...</option>
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  onChange={(e) => handleBulkAssign(e.target.value)}
                  disabled={isBulkOperating}
                  className="text-[11px] bg-white dark:bg-slate-900 border border-border-color rounded px-2 py-1 focus:ring-1 focus:ring-primary font-semibold m-0 w-auto"
                  defaultValue=""
                >
                  <option value="" disabled>Assign...</option>
                  <option value="unassign">Unassign</option>
                  {agents.map(agent => (
                    <option key={agent.publicId || agent._id} value={agent.email}>{agent.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header-row">
                  <th className="table-header-cell w-10 text-center px-2 py-2">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(displayedTickets.map(t => t.publicId));
                        else setSelectedIds([]);
                      }}
                      checked={selectedIds.length > 0 && selectedIds.length === displayedTickets.length}
                      className="w-3.5 h-3.5 rounded-sm border-slate-300 text-primary focus:ring-primary cursor-pointer m-0 block mx-auto"
                    />
                  </th>
                  <th className="table-header-cell">ID</th>
                  <th className="table-header-cell w-1/3">Subject</th>
                  <th className="table-header-cell">Contact</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Agent</th>
                  <th className="table-header-cell-right">Age</th>
                </tr>
              </thead>
              <tbody>
                {displayedTickets.length === 0 ? (
                  <tr className="table-row">
                    <td colSpan="7" className="py-12 text-center">
                      <p className="empty-state-text font-semibold">No tickets found in this view.</p>
                    </td>
                  </tr>
                ) : (
                  displayedTickets.map((ticket) => {
                    const isSelected = selectedIds.includes(ticket.publicId);
                    return (
                      <tr key={ticket.publicId} className={`table-row transition-none group ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                        <td className="table-cell text-center px-2 py-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(ticket.publicId)}
                            className="w-3.5 h-3.5 rounded-sm border-slate-300 text-primary focus:ring-primary cursor-pointer m-0 block mx-auto"
                          />
                        </td>
                        <td className="table-cell font-bold text-slate-500 whitespace-nowrap">
                          <Link href={`/tickets/${ticket.publicId}`} className="hover:text-primary transition-colors">
                            #{ticket.publicId}
                          </Link>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ticket.priority === 'high' ? 'bg-rose-500' : ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                            <Link href={`/tickets/${ticket.publicId}`} className="font-bold text-slate-800 dark:text-slate-200 hover:text-primary truncate max-w-[200px] sm:max-w-[300px]">
                              {ticket.title}
                            </Link>
                          </div>
                        </td>
                        <td className="table-cell text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                          {ticket.user_email}
                        </td>
                        <td className="table-cell">
                          <span className={`badge badge-status-${ticket.status.replace(' ', '-')}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="table-cell font-semibold text-slate-700 dark:text-slate-300">
                          {ticket.assignedToEmail || <span className="text-slate-400 italic font-normal">Unassigned</span>}
                        </td>
                        <td className="table-cell-right text-slate-500 whitespace-nowrap">
                          {getRelativeTimeString(ticket.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
