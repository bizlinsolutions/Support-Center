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

  function priorityBadge(priority) {
    if (priority === 'high') return 'badge-high';
    if (priority === 'medium') return 'badge-medium';
    return 'badge-low';
  }

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Active</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{activeTickets.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Open</p>
            <p className="text-2xl font-extrabold text-yellow-600 dark:text-yellow-500">{openCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Agents</p>
            <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-500">{adminsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout (Sidebar + Table) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Views Sidebar */}
        <div className="w-full lg:w-56 flex-shrink-0 space-y-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">Views</h3>
          {['All Active', 'Open', 'In Progress', 'Unassigned', 'High Priority'].map(view => (
            <button
              key={view}
              onClick={() => { setCurrentView(view); setSelectedIds([]); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-between group ${
                currentView === view 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{view}</span>
            </button>
          ))}
        </div>

        {/* Right High-Density Table */}
        <div className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          {/* Table Toolbar */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{currentView} Tickets ({displayedTickets.length})</h3>
            
            {/* Bulk Actions visible only when tickets selected */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => handleBulkStatus(e.target.value)}
                  disabled={isBulkOperating}
                  className="text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-primary font-semibold"
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
                  className="text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-primary font-semibold"
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
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(displayedTickets.map(t => t.publicId));
                        else setSelectedIds([]);
                      }}
                      checked={selectedIds.length > 0 && selectedIds.length === displayedTickets.length}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Subject</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Agent</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {displayedTickets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <p className="text-sm text-slate-500 font-semibold">No tickets found in this view.</p>
                    </td>
                  </tr>
                ) : (
                  displayedTickets.map((ticket) => {
                    const isSelected = selectedIds.includes(ticket.publicId);
                    return (
                      <tr key={ticket.publicId} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(ticket.publicId)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                          <Link href={`/tickets/${ticket.publicId}`} className="hover:text-primary transition-colors">
                            #{ticket.publicId}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ticket.priority === 'high' ? 'bg-red-500' : ticket.priority === 'medium' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                            <Link href={`/tickets/${ticket.publicId}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-primary truncate max-w-[200px] sm:max-w-[300px]">
                              {ticket.title}
                            </Link>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                          {ticket.user_email}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`badge-status-${ticket.status.replace(' ', '-')}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {ticket.assignedToEmail || <span className="text-slate-400 italic font-normal">Unassigned</span>}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 text-right whitespace-nowrap">
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
