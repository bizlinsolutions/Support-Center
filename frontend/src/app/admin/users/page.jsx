"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import adminAxios from '@/lib/adminAxios';
import { getAdminAccessToken } from '@/lib/adminAuth';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getAdminAccessToken()) {
      router.push('/admin/login');
      return;
    }

    const loadUsers = async () => {
      try {
        const res = await adminAxios.get('/admin/users');
        setUsers(res.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/admin/login');
          return;
        }
        setError('Unable to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [router]);

  const handleDeleteUser = async (userId, e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this user and all their tickets?')) return;
    try {
      await adminAxios.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/admin/login');
      } else {
        alert('Failed to delete user');
      }
    }
  };

  if (loading) {
    return <main><p>Loading users...</p></main>;
  }

  if (error) {
    return <main><p className="text-red-500">{error}</p></main>;
  }

  return (
    <main>
      <h2>Users</h2>
      <p>Select a user to view and manage their open tickets.</p>

      {users.map((user) => (
        <div key={user._id} className="card my-5 flex justify-between items-center relative">
          <Link href={`/admin/users/${user._id}`} className="flex-1">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </Link>
          <button 
            onClick={(e) => handleDeleteUser(user._id, e)}
            className="btn-danger ml-4"
          >
            Delete
          </button>
        </div>
      ))}

      {users.length === 0 && (
        <p className="text-center">No users found.</p>
      )}
    </main>
  );
}
