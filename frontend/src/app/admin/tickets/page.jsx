"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import adminAxios from '@/lib/adminAxios';
import { getAdminAccessToken } from '@/lib/adminAuth';

export default function AdminTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!getAdminAccessToken()) {
      router.push('/admin/login');
      return;
    }

    const loadTickets = async () => {
      try {
        const res = await adminAxios.get('/admin/tickets');
        setTickets(res.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/admin/login');
          return;
        }
        setError('Unable to load tickets');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [router]);

  if (loading) {
    return <main><p>Loading tickets...</p></main>;
  }

  if (error) {
    return <main><p className="text-red-500">{error}</p></main>;
  }

  const filteredTickets = tickets.filter(ticket => {
    const q = searchQuery.toLowerCase();
    return (
      ticket.title?.toLowerCase().includes(q) ||
      ticket.body?.toLowerCase().includes(q) ||
      ticket.user_email?.toLowerCase().includes(q)
    );
  });

  return (
    <main>
      <h2>All Tickets</h2>
      <p>Manage all user tickets across the platform.</p>

      <div className="my-6">
        <input 
          type="text" 
          placeholder="Search tickets by title, content, or user email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {filteredTickets.map((ticket) => (
        <div key={ticket._id} className="card my-5 relative hover:shadow-md transition-shadow">
          <Link href={`/admin/tickets/${ticket._id}`} className="block">
            <h3 className="mb-2">{ticket.title}</h3>
            <div className="flex justify-between items-center mt-4">
              <small className="text-gray-500"><b>User:</b> {ticket.user_email}</small>
              <div className={`pill ${ticket.priority} m-0`}>{ticket.priority} priority</div>
            </div>
            <p className="mt-4 text-primary font-medium hover:underline">{ticket.body.slice(0,200)}...</p>
          </Link>
        </div>
      ))}

      {filteredTickets.length === 0 && (
        <p className="text-center">No tickets found.</p>
      )}
    </main>
  );
}
