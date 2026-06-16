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
      setSelectedIds(activeTickets.map(t => t._id));
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

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-slate-900 dark:to-slate-900/40 p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">Admin Dashboard</h2>
            <span className="badge-admin">Admin Control</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold max-w-2xl">
            Welcome back, <span className="font-extrabold text-primary">{currentUser?.name || 'Admin'}</span>. Oversee active support tickets and user statistics.
          </p>
        </div>
        <div className="relative z-10 flex-shrink-0">
          <Link href="/tickets/create" className="bg-primary text-white font-bold py-2.5 px-4 rounded-lg text-xs hover:bg-primary-hover shadow-sm transition-all min-h-[44px] inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create Ticket
          </Link>
        </div>
      </div>

      {/* System Overview Section */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          System Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider block">Total Tickets</span>
            <p className="text-2xl md:text-3xl font-extrabold mt-2 text-slate-800 dark:text-white">{totalTickets}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider block">Registered Users</span>
            <p className="text-2xl md:text-3xl font-extrabold mt-2 text-slate-800 dark:text-white">{activeUsersCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <span className="text-purple-650 dark:text-purple-400 text-[10px] md:text-xs font-bold uppercase tracking-wider block">Admins</span>
            <p className="text-2xl md:text-3xl font-extrabold mt-2 text-purple-750 dark:text-purple-400">{adminsCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <span className="text-emerald-500 dark:text-emerald-400 text-[10px] md:text-xs font-bold uppercase tracking-wider block">Closed Tickets</span>
            <p className="text-2xl md:text-3xl font-extrabold mt-2 text-emerald-650 dark:text-emerald-400">{closedCount}</p>
          </div>
        </div>
      </div>

      {/* Priority & Status Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Tickets by Priority</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100/40 dark:border-red-900/10">
              <span className="text-[10px] font-bold text-red-650 dark:text-red-400 uppercase tracking-wider">High</span>
              <p className="text-2xl font-extrabold text-red-750 dark:text-red-300 mt-1">{highPriorityCount}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100/40 dark:border-blue-900/10">
              <span className="text-[10px] font-bold text-blue-650 dark:text-blue-400 uppercase tracking-wider">Medium</span>
              <p className="text-2xl font-extrabold text-blue-750 dark:text-blue-300 mt-1">{mediumPriorityCount}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100/40 dark:border-emerald-900/10">
              <span className="text-[10px] font-bold text-emerald-650 dark:text-emerald-400 uppercase tracking-wider">Low</span>
              <p className="text-2xl font-extrabold text-emerald-750 dark:text-emerald-300 mt-1">{lowPriorityCount}</p>
            </div>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Tickets by Status</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-xl border border-yellow-100/40 dark:border-yellow-900/10">
              <span className="text-[10px] font-bold text-yellow-650 dark:text-yellow-450 uppercase tracking-wider">Open</span>
              <p className="text-2xl font-extrabold text-yellow-750 dark:text-yellow-350 mt-1">{openCount}</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100/40 dark:border-indigo-900/10">
              <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">In Progress</span>
              <p className="text-2xl font-extrabold text-indigo-750 dark:text-indigo-350 mt-1">{inProgressCount}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Closed</span>
              <p className="text-2xl font-extrabold text-slate-750 dark:text-slate-350 mt-1">{closedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket List and Bulk operations */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 md:p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Active Tickets ({activeTickets.length})
          </h3>
          
          {activeTickets.length > 0 && (
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 select-none cursor-pointer">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedIds.length === activeTickets.length && activeTickets.length > 0}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
              Select All
            </label>
          )}
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {activeTickets.map((ticket) => {
            const isSelected = selectedIds.includes(ticket._id);
            return (
              <div
                key={ticket._id}
                className={`group border p-4 rounded-xl transition-all flex items-start gap-4 ${
                  isSelected
                    ? 'border-primary/50 bg-primary/[0.02] dark:bg-primary/[0.04]'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                }`}
              >
                {/* Checkbox for selection */}
                <div className="pt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(ticket._id)}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer min-w-[20px] min-h-[20px]"
                  />
                </div>

                  <div className="flex-1 min-w-0">
                  <Link href={`/tickets/${ticket._id}`} className="block">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <h5 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-primary transition-colors min-w-0 flex-1">
                        {ticket.title}
                      </h5>
                      <div className="flex gap-2 items-center flex-shrink-0">
                        <span className={priorityBadge(ticket.priority)}>
                          {ticket.priority}
                        </span>
                        <span className={`badge-status-${ticket.status.replace(' ', '-')}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs truncate mt-2 leading-relaxed">
                      {ticket.body}
                    </p>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 flex flex-col sm:flex-row sm:justify-between gap-1 font-semibold">
                      <span className="truncate">By {ticket.user_email} • {getRelativeTimeString(ticket.createdAt)}</span>
                      <span className="truncate">Assigned: <strong className="text-slate-655 dark:text-slate-300">{ticket.assignedToEmail || 'Unassigned'}</strong></span>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}

          {activeTickets.length === 0 && (
            <div className="empty-state">
              <svg className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="empty-state-text font-semibold">No active support tickets found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bulk Actions Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 text-white dark:bg-white dark:border-slate-200 dark:text-slate-900 px-6 py-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl w-[90%] max-w-3xl transition-all duration-300 animate-slide-in">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black bg-primary px-3 py-1 rounded-full text-white">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-slate-350 dark:text-slate-600">tickets selected</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center w-full md:w-auto">
            {/* Status Option */}
            <div className="flex items-center gap-1 bg-slate-855 dark:bg-slate-50 border border-slate-800 dark:border-slate-200 rounded-lg px-2 py-1 min-h-[44px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1 px-1">Status:</span>
              <select
                onChange={(e) => handleBulkStatus(e.target.value)}
                disabled={isBulkOperating}
                className="text-xs bg-transparent border-0 text-white dark:text-slate-850 focus:ring-0 p-0 m-0 w-auto font-semibold cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Change...</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Agent Option */}
            <div className="flex items-center gap-1 bg-slate-855 dark:bg-slate-50 border border-slate-800 dark:border-slate-200 rounded-lg px-2 py-1 min-h-[44px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1 px-1">Agent:</span>
              <select
                onChange={(e) => handleBulkAssign(e.target.value)}
                disabled={isBulkOperating}
                className="text-xs bg-transparent border-0 text-white dark:text-slate-850 focus:ring-0 p-0 m-0 w-auto font-semibold cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Assign...</option>
                <option value="unassign">-- Unassign --</option>
                {agents.map(agent => (
                  <option key={agent._id} value={agent.email}>{agent.name}</option>
                ))}
              </select>
            </div>

            {/* Delete Option */}
            <button
              onClick={handleBulkDelete}
              disabled={isBulkOperating}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-xs font-extrabold transition-all shadow-sm cursor-pointer min-h-[44px]"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
