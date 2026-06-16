"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import fetchClient from '../lib/fetchClient';
import { useToast } from '../components/Toast';

export default function Profile() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Read current user from cookie
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user='));
    const userCookie = match ? match.split('=')[1] : null;
    if (userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie));
        setName(user.name || '');
        setEmail(user.email || '');
        setRole(user.role || 'user');
      } catch (e) {
        console.error('Failed to parse user cookie:', e);
      }
    }
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password && password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const payload = { name };
      if (password) {
        payload.password = password;
      }

      const data = await fetchClient('/users/profile', {
        method: 'PATCH',
        data: payload,
      });

      // Update the user cookie
      document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      showToast('Profile updated successfully!', 'success');
      setPassword('');
      setConfirmPassword('');
      router.refresh();
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-xl my-8 mx-auto px-4 space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 min-h-[44px]">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8">
        <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white mb-1 tracking-tight">My Profile</h2>
        <p className="text-xs text-slate-500 mb-6 font-semibold">Manage your display settings, roles, and security details</p>

        <form onSubmit={handleUpdateProfile} className="space-y-5 bg-transparent border-0 shadow-none p-0 max-w-full">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-950/40 text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-850 rounded-lg text-sm font-semibold min-h-[44px]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Account Role
            </label>
            <span className={`inline-block text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${role === 'admin'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
              : 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {role}
            </span>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[44px]"
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 my-6 pt-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white">Change Password</h3>
              <p className="text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase mt-0.5">Leave blank if you do not want to update password</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-855 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-855 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[44px]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex justify-center items-center gap-2 cursor-pointer min-h-[44px]"
          >
            {isLoading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </main>
  );
}
