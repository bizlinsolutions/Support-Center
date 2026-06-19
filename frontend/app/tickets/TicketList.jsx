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

    return (
        <div className="space-y-6">
            {/* Show active search indicator if searchParam exists */}
            {searchParam && (
                <div className="flex justify-between items-center bg-card-bg border border-border-color py-3 px-4 rounded-md text-[13px] font-semibold">
                    <span>Showing search results for: <strong className="text-primary">"{searchParam}"</strong></span>
                    <Link href="/tickets" className="text-rose-600 hover:underline">Clear Search</Link>
                </div>
            )}

            {/* Ticket List Display */}
            {loading ? (
                <div className="text-center py-12">
                    <svg className="animate-spin h-6 w-6 text-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-slate-500 text-[13px]">Loading tickets...</p>
                </div>
            ) : error ? (
                <p className="text-center text-rose-500 py-4 font-semibold">{error}</p>
            ) : (
                <>
                    <div className="table-card">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="table-header-row">
                                        <th className="table-header-cell">ID</th>
                                        <th className="table-header-cell w-1/2">Subject</th>
                                        <th className="table-header-cell">Priority</th>
                                        <th className="table-header-cell">Status</th>
                                        <th className="table-header-cell">Agent</th>
                                        <th className="table-header-cell-right">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.length === 0 ? (
                                        <tr className="table-row">
                                            <td colSpan="6" className="py-12 text-center">
                                                <p className="empty-state-text font-semibold mb-3">No tickets found matching the search criteria.</p>
                                                <Link href="/tickets/create" className="btn-outline inline-flex">
                                                    Create a Ticket
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        tickets.map((ticket) => (
                                            <tr key={ticket.publicId} className="table-row hover:bg-background transition-none group">
                                                <td className="table-cell font-bold text-slate-500 whitespace-nowrap">
                                                    <Link href={`/tickets/${ticket.publicId}`} className="hover:text-primary transition-none">
                                                        #{ticket.publicId}
                                                    </Link>
                                                </td>
                                                <td className="table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ticket.priority === 'high' ? 'bg-rose-500' : ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                                        <Link href={`/tickets/${ticket.publicId}`} className="font-bold text-slate-800 dark:text-slate-200 hover:text-primary transition-none line-clamp-1">
                                                            {ticket.title}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="table-cell whitespace-nowrap">
                                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${ticket.priority === 'high' ? 'text-rose-600' : ticket.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="table-cell whitespace-nowrap">
                                                    <span className={`badge badge-status-${ticket.status.replace(' ', '-')}`}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td className="table-cell font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                    {ticket.assignedToEmail || <span className="text-slate-400 italic font-normal">Unassigned</span>}
                                                </td>
                                                <td className="table-cell-right text-slate-500 whitespace-nowrap">
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
                                className="btn-outline disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-[13px] text-slate-500">
                                Page <strong className="text-slate-800 dark:text-slate-200">{page}</strong> of <strong className="text-slate-800 dark:text-slate-200">{pagination.pages}</strong>
                            </span>
                            <button
                                onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))}
                                disabled={page === pagination.pages}
                                className="btn-outline disabled:opacity-50"
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
        <Suspense fallback={<p className="text-center py-4 text-[13px] text-slate-500">Loading ticket list...</p>}>
            <TicketListContent />
        </Suspense>
    );
}
