"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import fetchClient from '../lib/fetchClient';
import Logo from '../components/logo.jpg';
import { useToast } from '../components/Toast';

export default function Signup() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await fetchClient('/auth/signup', {
        method: 'POST',
        data: {
          name,
          email,
          password,
        },
      });

      document.cookie = `token=${data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      showToast(`Welcome to DeskFlow, ${data.user.name}! Your account has been created.`, 'success');
      router.refresh();
      router.push('/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      {/* Left panel: branding, tagline, gradient */}
      <div className="relative hidden md:flex flex-col justify-between p-12 bg-slate-900 overflow-hidden">
        {/* Background gradient/pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 z-0 opacity-90" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] z-0" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] z-0" />
        
        {/* Top brand */}
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src={Logo}
            alt='DeskFlow Helpdesk Logo'
            width={40}
            height={40}
            className="rounded-xl shadow-lg border border-white/10"
            quality={100}
          />
          <span className="text-lg font-extrabold text-white font-sans tracking-tight">
            DeskFlow
          </span>
        </div>

        {/* Center message */}
        <div className="relative z-10 max-w-md my-auto space-y-6">
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            Join DeskFlow Today
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            Create an account to start submitting tickets, tracking replies, and collaborating with support agents in a centralized interface.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="relative z-10 text-xs text-slate-500 font-semibold">
          © {new Date().getFullYear()} DeskFlow Helpdesk. All rights reserved.
        </div>
      </div>

      {/* Right panel: Signup form */}
      <div className="flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 bg-white dark:bg-slate-950">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="text-center md:text-left space-y-2">
            {/* Show brand on mobile only */}
            <div className="md:hidden flex justify-center mb-6">
              <div className="flex items-center gap-3">
                <Image
                  src={Logo}
                  alt='DeskFlow Logo'
                  width={40}
                  height={40}
                  className="rounded-xl shadow-md"
                />
                <span className="text-lg font-extrabold text-slate-800 dark:text-white">DeskFlow</span>
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Join DeskFlow and start managing your support issues with ease.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5 bg-transparent border-0 shadow-none p-0 max-w-full my-0">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Adithya Ajith"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-855 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[44px]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. adithya@theesaanam.com"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-855 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[44px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password (at least 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-855 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[44px]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex justify-center items-center gap-2 cursor-pointer min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center md:text-left text-sm text-slate-500 dark:text-slate-400 font-semibold">
            Already registered?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
