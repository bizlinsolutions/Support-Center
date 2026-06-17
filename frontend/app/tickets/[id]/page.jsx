"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import fetchClient from '../../lib/fetchClient';
import { getRelativeTimeString } from '../../lib/relativeTime';
import DeleteButton from './DeleteButton';
import Link from 'next/link';
import { useToast } from '../../components/Toast';

export default function TicketDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // States for comment and updates
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const [agents, setAgents] = useState([]);
  const [statusChanging, setStatusChanging] = useState(false);
  const [assigningAgent, setAssigningAgent] = useState(false);

  const loadTicket = async (currentUser) => {
    try {
      const data = await fetchClient(`/tickets/${id}`);
      setTicket(data);

      // Fetch admins/agents if the current user is an admin
      if (currentUser && currentUser.role === 'admin') {
        const usersList = await fetchClient('/admin/users');
        setAgents(usersList.filter(u => u.role === 'admin'));
      }
    } catch (err) {
      console.error('Failed to fetch ticket details:', err.message);
      setError(err.message || 'Ticket not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Get logged-in user cookie
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user='));
    const userCookie = match ? match.split('=')[1] : null;
    let currentUser = null;
    if (userCookie) {
      try {
        currentUser = JSON.parse(decodeURIComponent(userCookie));
        setUser(currentUser);
      } catch (e) {
        console.error('Failed to parse user cookie:', e);
      }
    }

    if (id) {
      loadTicket(currentUser);
    }
  }, [id]);

  // Handle status update
  const handleStatusChange = async (newStatus) => {
    setStatusChanging(true);
    try {
      const updatedTicket = await fetchClient(`/tickets/${id}/status`, {
        method: 'PATCH',
        data: { status: newStatus },
      });
      setTicket(updatedTicket);
      showToast(`Ticket status updated to ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setStatusChanging(false);
    }
  };

  // Handle agent assignment
  const handleAssignAgent = async (email) => {
    setAssigningAgent(true);
    try {
      const updatedTicket = await fetchClient(`/tickets/${id}/assign`, {
        method: 'PATCH',
        data: { assignedToEmail: email || null },
      });
      setTicket(updatedTicket);
      showToast(email ? `Assigned ticket to ${email}` : 'Unassigned ticket', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to assign agent', 'error');
    } finally {
      setAssigningAgent(false);
    }
  };

  // Handle comment submit
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const updatedTicket = await fetchClient(`/tickets/${id}/comments`, {
        method: 'POST',
        data: { body: newComment },
      });
      setTicket(updatedTicket);
      setNewComment('');
      showToast('Comment posted successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <main>
        <div className="text-center py-16">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 text-sm">Loading ticket details...</p>
        </div>
      </main>
    );
  }

  if (!ticket) {
    return (
      <main>
        <div className="text-center py-12">
          <p className="text-red-500 mb-6 font-bold">{error || 'Ticket not found'}</p>
          <button onClick={() => router.push('/tickets')} className="btn-primary inline-flex mx-auto min-h-[44px] justify-center items-center">
            Back to Tickets
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl my-8 mx-auto px-4">
      {/* Back to tickets link */}
      <Link href="/tickets" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 mb-6 min-h-[44px]">
        ← Back to Support Tickets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ticket Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Ticket Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-primary/10 text-primary font-bold text-xs px-2.5 py-1 rounded-md tracking-wider">
                      #{ticket.publicId}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                      Created {getRelativeTimeString(ticket.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
                    {ticket.title}
                  </h2>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                  <span className={`pill ${ticket.priority}`}>
                    {ticket.priority} priority
                  </span>
                  <span className={`badge-status-${ticket.status.replace(' ', '-')}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                  {ticket.user_email.charAt(0).toUpperCase()}
                </div>
                <span>Requested by <strong className="text-slate-800 dark:text-white">{ticket.user_email}</strong></span>
              </div>
            </div>

            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base whitespace-pre-line leading-relaxed font-medium">
                {ticket.body}
              </p>
            </div>

            {/* Delete button (Admin or Owner) */}
            {user && (user.email === ticket.user_email || user.role === 'admin') && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end px-6 pb-6">
                <DeleteButton ticketId={ticket.publicId} />
              </div>
            )}
          </div>

          {/* Comments/Replies Thread */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Replies ({ticket.comments?.length || 0})
            </h3>

            {/* Comments List */}
            <div className="space-y-4 mb-6">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-1.5 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{comment.authorName}</span>
                        {comment.authorEmail === ticket.user_email ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded uppercase">Owner</span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded uppercase">Staff</span>
                        )}
                      </div>
                      <span className="text-slate-400 dark:text-slate-500">{getRelativeTimeString(comment.createdAt)}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed font-medium">
                      {comment.body}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-slate-500 py-4 font-semibold">No comments or replies yet. Post one below!</p>
              )}
            </div>

            {/* Post comment form */}
            <form onSubmit={handleAddComment} className="bg-transparent shadow-none border-0 p-0 max-w-full">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Post a Reply
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your reply here..."
                required
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="btn-primary px-4 py-2.5 min-h-[44px] justify-center items-center"
                >
                  {isSubmittingComment ? 'Sending...' : 'Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Settings Column */}
        <div className="space-y-6">
          {/* Timeline / Info Block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Timeline</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white dark:border-slate-900 bg-primary text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-odd:pr-4 md:group-even:pl-4">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Ticket Created</div>
                  <div className="text-[10px] text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              {ticket.resolvedAt && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white dark:border-slate-900 bg-green-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-odd:pr-4 md:group-even:pl-4">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Resolved</div>
                    <div className="text-[10px] text-slate-500">{new Date(ticket.resolvedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
              {ticket.closedAt && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white dark:border-slate-900 bg-slate-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-odd:pr-4 md:group-even:pl-4">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Closed</div>
                    <div className="text-[10px] text-slate-500">{new Date(ticket.closedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Settings / Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Settings</h3>

            {/* Status Selector (Admins & Owners) */}
            {user && (user.role === 'admin' || user.email === ticket.user_email) && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Change Status
                </label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusChanging}
                  className="w-full text-xs rounded-lg py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 min-h-[44px] focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer font-semibold"
                >
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}

            {/* Agent Assignee (Admins only) */}
            {user && user.role === 'admin' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Assign Agent
                </label>
                <select
                  value={ticket.assignedToEmail || ''}
                  onChange={(e) => handleAssignAgent(e.target.value)}
                  disabled={assigningAgent}
                  className="w-full text-xs rounded-lg py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 min-h-[44px] focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer font-semibold"
                >
                  <option value="">-- Unassigned --</option>
                  {agents.map((agent) => (
                    <option key={agent.publicId || agent._id} value={agent.email}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Assigned to Info (For regular users) */}
            {user && user.role !== 'admin' && (
              <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="block text-slate-400 font-bold uppercase text-[9px] tracking-wider">Assigned Support Agent</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  {ticket.assignedToEmail || 'Assignee Pending'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
