"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import Logo from './logo.jpg';
import LogoutButton from './LogoutButton';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Re-runs every time the route changes
  useEffect(() => {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user='));
    if (match) {
      try {
        const currentUser = JSON.parse(decodeURIComponent(match.split('=')[1]));
        setUser(currentUser);
      } catch (e) {
        console.error('Failed to parse user cookie in Navbar:', e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  // Initialize Dark Mode
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tickets?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/tickets');
    }
  };

  const triggerMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
  };

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const showSidebar = user && !isAuthPage;

  return (
    <header className={`fixed top-0 right-0 h-16 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 md:px-6 ${showSidebar ? 'left-[220px]' : 'left-0'}`}>
      {/* Mobile Drawer Trigger (Hamburger) */}
      {user && (
        <button
          onClick={triggerMobileSidebar}
          className="md:hidden p-2 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 mr-2 transition-none cursor-pointer bg-transparent border-0 min-h-[40px]"
          aria-label="Toggle Navigation Sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Left branding */}
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-bold text-slate-800 dark:text-white tracking-tight uppercase">
          DeskFlow Helpdesk
        </span>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 flex justify-center px-4 md:px-8">
        {user && (
          <form onSubmit={handleSearchSubmit} className="w-full max-w-md bg-transparent border-0 shadow-none p-0 my-0">
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary transition-none m-0"
              />
            </div>
          </form>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Add Button */}
        {user && (
          <Link href="/tickets/create" className="hidden sm:flex bg-primary text-white px-3 py-1.5 rounded hover:bg-primary-hover transition-none font-semibold text-[13px] items-center gap-1" title="New Ticket">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </Link>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-none cursor-pointer bg-transparent"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {user ? (
          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-3">
            {user.role && (
              <span className={`text-[11px] px-1.5 py-0.5 border rounded uppercase tracking-wider hidden sm:inline-block ${user.role === 'admin'
                  ? 'border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-400'
                  : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}>
                {user.role}
              </span>
            )}
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate hidden md:inline-block">
              {user.name || user.email}
            </span>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
            <Link href="/login" className="text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-none">Login</Link>
            <Link href="/signup" className="bg-primary text-white px-3 py-1.5 rounded hover:bg-primary-hover transition-none">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
}