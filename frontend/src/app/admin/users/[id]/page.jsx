"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import adminAxios from '@/lib/adminAxios';
import { getAdminAccessToken } from '@/lib/adminAuth';

export default function AdminUserTicketsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!getAdminAccessToken()) {
      router.push('/admin/login');
      return;
    }

    const loadUserTickets = async () => {
      try {
        const res = await adminAxios.get(`/admin/users/${id}/tickets`);
        setUser(res.data.user);
        setTickets(res.data.tickets);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/admin/login');
          return;
        }
        if (err.response?.status === 404) {
          setError('User not found');
          return;
        }
        setError('Unable to load user tickets');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadUserTickets();
    }
  }, [id, router]);

  if (loading) {
    return <main><p>Loading tickets...</p></main>;
  }

  if (error) {
    return (
      <main>
        <p className="text-red-500">{error}</p>
        <button className="btn-primary" onClick={() => router.push('/admin/users')}>Back to Users</button>
      </main>
    );
  }

  const filteredTickets = tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ticket.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main>
      <nav>
        <h2>{user?.name}&apos;s Open Tickets</h2>
      </nav>
      <p>{user?.email}</p>

      <div className="mb-6 mt-4">
        <input 
            type="text" 
            placeholder="Search tickets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 rounded border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
        />
      </div>

      {filteredTickets.map((ticket) => (
        <div key={ticket._id} className="card my-5 relative hover:shadow-md transition-shadow">
          <Link href={`/admin/tickets/${ticket._id}`} className="block">
            <h3 className="mb-2">{ticket.title}</h3>
            <div className="flex justify-between items-center mt-4">
              <div className={`pill ${ticket.priority} m-0`}>{ticket.priority} priority</div>
            </div>
            <p className="mt-4 text-primary font-medium hover:underline">{ticket.body.slice(0,200)}...</p>
          </Link>
        </div>
      ))}

      <br />

      {tickets.length === 0 ? (
        <p className="text-center">This user has no open tickets.</p>
      ) : filteredTickets.length === 0 && (
        <p className="text-center">No tickets match your search.</p>
      )}

      <br />

      <center>
      <p>
        <button className="btn-primary" onClick={() => router.push('/admin/users')}>Back to Users</button>
      </p>
      </center>
    </main>
  );
}
