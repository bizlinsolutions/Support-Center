"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import adminAxios from '@/lib/adminAxios';
import { getAdminAccessToken } from '@/lib/adminAuth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ userCount: 0, ticketCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getAdminAccessToken()) {
      router.push('/admin/login');
      return;
    }

    const loadStats = async () => {
      try {
        const res = await adminAxios.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/admin/login');
          return;
        }
        setError('Unable to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [router]);

  if (loading) {
    return <main><p>Loading dashboard...</p></main>;
  }

  if (error) {
    return <main><p className="text-red-500">{error}</p></main>;
  }

  return (
    <main>
      <h2>Admin Dashboard</h2>
      <p>Manage users and their support tickets from this panel.</p>

      <div className="card">
        <h3>Total Users</h3>
        <p>{stats.userCount}</p>
      </div>

      <div className="card">
        <h3>Total Open Tickets</h3>
        <p>{stats.ticketCount}</p>
      </div>

      <div className="flex justify-center-safe">
        <Link href="/admin/users">
          <button className="btn-primary">View All Users</button>
        </Link>
      </div>
    </main>
  );
}
