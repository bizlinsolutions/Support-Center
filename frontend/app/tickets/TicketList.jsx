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
                    <div className="space-y-4">
                        {tickets.map((ticket) => (
                            <div key={ticket._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all relative">
                                <Link href={`/tickets/${ticket._id}`} className="block">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight min-w-0 flex-1">
                                            {ticket.title}
                                        </h3>
                                        <div className="flex gap-2 items-center flex-shrink-0">
                                            <span className={`pill ${ticket.priority}`}>
                                                {ticket.priority}
                                            </span>
                                            <span className={`badge-status-${ticket.status.replace(' ', '-')}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 my-2 leading-relaxed">
                                        {ticket.body}
                                    </p>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3">
                                        <span>Created on {formatDateISO(ticket.createdAt)}</span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {tickets.length === 0 && (
                        <div className="empty-state">
                            <p className="empty-state-text">No tickets found matching the search criteria.</p>
                        </div>
                    )}

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
