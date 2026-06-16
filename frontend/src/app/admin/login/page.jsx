"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import adminAxios from '@/lib/adminAxios';
import { setAdminSession } from '@/lib/adminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminAxios.post('/admin/auth/login', { email, password });
      setAdminSession({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        admin: res.data.admin,
      });
      router.push('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          <span>Admin Email:</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          <span>Password:</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && <p className="text-red-500">{error}</p>}
        <center>
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login as Admin'}
        </button>
        </center>
      </form>

      <center>
      <p style={{ marginTop: '1rem' }}>
        User login? <Link href="/login">Go to user login</Link>
      </p>
      </center>
    </main>
  );
}
