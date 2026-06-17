"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { formatDateISO } from '../lib/formatDate';
import { useSearchParams } from 'next/navigation';
import fetchClient from '../lib/fetchClient';

function TicketListContent() {
    const searchParams = useSearchParams();
    const searchParam = searchParams.get('search') || '';

    const [tickets, setTickets] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);

    // Reset page to 1 when search param changes
    useEffect(() => {
        setPage(1);
    }, [searchParam]);

    // Fetch tickets whenever search query or page changes
    const loadTickets = async () => {
        setLoading(true);
        setError('');
        try {
            const queryParams = new URLSearchParams({
                search: searchParam,
                page,
                limit: 10
            }).toString();

            const data = await fetchClient(`/tickets?${queryParams}`);
            setTickets(data.tickets || []);
            setPagination(data.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
        } catch (err) {
            console.error('Failed to fetch tickets:', err.message);
            setError(err.message || 'Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, [searchParam, page]);

    // Priority badge style helper
    function priorityBadge(p) {
        if (p === 'high') return 'badge-high';
        if (p === 'medium') return 'badge-medium';
        return 'badge-low';
    }

    return (
        <div className="space-y-6">
            {/* Show active search indicator if searchParam exists */}
            {searchParam && (
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3 px-5 rounded-xl text-xs font-semibold">
                    <span>Showing search results for: <strong className="text-primary">"{searchParam}"</strong></span>
                    <Link href="/tickets" className="text-red-500 hover:underline">Clear Search</Link>
                </div>
            )}

            {/* Ticket List Display */}
            {loading ? (
                <div className="text-center py-12">
                    <svg className="animate-spin h-6 w-6 text-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-slate-500 text-xs">Loading tickets...</p>
                </div>
            ) : error ? (
                <p className="text-center text-red-500 py-4 font-semibold">{error}</p>
            ) : (
                <>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                                        <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                                        <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/2">Subject</th>
                                        <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                        <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Agent</th>
                                        <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {tickets.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center">
                                                <p className="text-sm text-slate-500 font-semibold mb-3">No tickets found matching the search criteria.</p>
                                                <Link href="/tickets/create" className="inline-block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                                    Create a Ticket
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        tickets.map((ticket) => (
                                            <tr key={ticket.publicId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="py-3.5 px-5 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                    <Link href={`/tickets/${ticket.publicId}`} className="hover:text-primary transition-colors">
                                                        #{ticket.publicId}
                                                    </Link>
                                                </td>
                                                <td className="py-3.5 px-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ticket.priority === 'high' ? 'bg-red-500' : ticket.priority === 'medium' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                                                        <Link href={`/tickets/${ticket.publicId}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-primary transition-colors line-clamp-1">
                                                            {ticket.title}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    <span className={`pill ${ticket.priority}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    <span className={`badge-status-${ticket.status.replace(' ', '-')}`}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                    {ticket.assignedToEmail || <span className="text-slate-400 italic font-normal">Unassigned</span>}
                                                </td>
                                                <td className="py-3.5 px-5 text-xs text-slate-500 text-right whitespace-nowrap">
                                                    {formatDateISO(ticket.createdAt)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="btn-outline px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-xs text-slate-500">
                                Page <strong>{page}</strong> of <strong>{pagination.pages}</strong>
                            </span>
                            <button
                                onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))}
                                disabled={page === pagination.pages}
                                className="btn-outline px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function TicketList() {
    return (
        <Suspense fallback={<p className="text-center py-4">Loading ticket list...</p>}>
            <TicketListContent />
        </Suspense>
    );
}
