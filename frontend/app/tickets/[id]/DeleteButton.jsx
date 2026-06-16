"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import fetchClient from '../../lib/fetchClient';
import { useToast } from '../../components/Toast';

export default function DeleteButton({ ticketId }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this ticket? This action is permanent.')) {
      return;
    }

    setIsDeleting(true);

    try {
      await fetchClient(`/tickets/${ticketId}`, { method: 'DELETE' });
      showToast('Ticket deleted successfully', 'success');
      router.refresh();
      router.push('/tickets');
    } catch (err) {
      showToast(err.message || 'Failed to delete ticket', 'error');
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-600 hover:bg-red-750 text-white font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer text-xs disabled:opacity-50 min-h-[44px] flex justify-center items-center gap-1.5"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      {isDeleting ? 'Deleting...' : 'Delete Ticket'}
    </button>
  );
}
