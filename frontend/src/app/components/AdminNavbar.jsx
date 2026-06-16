"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import adminAxios from '@/lib/adminAxios';
import {
  clearAdminSession,
  getAdminAccessToken,
  getAdminAuthChangeEventName,
  getAdminRefreshToken,
} from '@/lib/adminAuth';
import Logo from './logo.png';
import { LogOut } from 'lucide-react';

export default function AdminNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(Boolean(getAdminAccessToken()));
    const syncAuthState = () => setIsLoggedIn(Boolean(getAdminAccessToken()));
    const authEvent = getAdminAuthChangeEventName();

    window.addEventListener(authEvent, syncAuthState);
    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener(authEvent, syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await adminAxios.post('/admin/auth/logout', { refreshToken: getAdminRefreshToken() });
    } catch (_) {
      // No-op
    } finally {
      clearAdminSession();
      setIsLoggedIn(false);
      window.location.href = '/admin/login';
    }
  };

  if (!mounted) return <nav className="h-20 bg-card border-b border-border m-0 max-w-none"></nav>;

  return (
    <nav className="h-auto md:h-20 py-4 md:py-0 bg-card border-b border-border flex flex-col md:flex-row items-center justify-between px-4 md:px-8 gap-4 md:gap-0 shadow-sm m-0 max-w-none transition-colors duration-200">
      <div className="flex items-center gap-4">
        <Image
          src={Logo}
          alt="MyHelpdesk Logo"
          width={40}
          height={40}
          priority
          className="rounded-lg shadow-sm"
        />
        <h1 className="text-xl font-extrabold  text-primary m-0">MyHelpdesk Admin</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
        {isLoggedIn ? (
          <>
            <Link href="/admin" className="px-3 md:px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/admin/users" className="px-3 md:px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Users</Link>
            <div className="h-8 w-px bg-border mx-1 md:mx-2 hidden sm:block"></div>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all border-none cursor-pointer p-0" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div className="flex gap-3 items-center">
            <Link href="/admin/login" className="btn-primary !m-0">Admin Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
