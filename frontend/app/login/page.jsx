"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import fetchClient from '../lib/fetchClient';
import { useToast } from '../components/Toast';

export default function Login() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await fetchClient('/auth/login', {
        method: 'POST',
        data: { email, password },
      });

      document.cookie = `token=${data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      showToast(`Welcome back, ${data.user.name}!`, 'success');
      router.refresh();
      router.push('/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-8 h-8 bg-primary flex items-center justify-center text-white font-bold text-[13px] rounded mb-4">
            D
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sign in to DeskFlow
          </h2>
          <p className="text-[13px] text-slate-500 mt-1">
            Welcome back! Please enter your details.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[13px] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary transition-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[13px] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary transition-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-semibold py-2 px-4 rounded text-[13px] hover:bg-primary-hover focus:outline-none transition-none flex justify-center items-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
