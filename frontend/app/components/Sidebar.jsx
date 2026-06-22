"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/login/admin' || pathname === '/signup';

  useEffect(() => {
    const getCookie = () => {
      const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user='));
      if (match) {
        try {
          return JSON.parse(decodeURIComponent(match.split('=')[1]));
        } catch (e) {
          return null;
        }
      }
      return null;
    };

    setUser(getCookie());
  }, [pathname]);

  useEffect(() => {
    const handleMobileToggle = () => {
      setIsMobileOpen(prev => !prev);
    };

    window.addEventListener('toggle-mobile-sidebar', handleMobileToggle);
    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleMobileToggle);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (isAuthPage || !user) return null;

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    },
    {
      label: 'My Tickets',
      href: '/tickets',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 5H7v14h10V7h-2M9 5v2h2V5M9 5h2m-3 7h3m-3 4h3" />
        </svg>
      )
    },
    {
      label: 'New Ticket',
      href: '/tickets/create',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const adminItems = [
    {
      label: 'Manage Users',
      href: '/admin/users',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 19v-6h-4v6h4zm6 0V9h-4v10h4zm6 0V5h-4v14h4z" />
        </svg>
      )
    }
  ];

  const allItems = [...navItems, ...adminItems];

  const isActiveLink = (item) => {
    return (
      pathname === item.href ||
      (item.href !== '/' &&
        pathname.startsWith(item.href) &&
        !allItems.some(
          (other) =>
            other.href !== item.href &&
            other.href.length > item.href.length &&
            pathname.startsWith(other.href)
        ))
    );
  };

  const getInitials = (name) => {
    if (!name) return 'DF';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-[220px]
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="w-6 h-6 bg-primary flex items-center justify-center text-white font-bold text-[11px] rounded flex-shrink-0">
            D
          </div>
          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            DeskFlow
          </span>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          {/* Main Nav Items */}
          <nav className="space-y-0.5 mb-6">
            {navItems.map((item) => {
              const active = isActiveLink(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 text-[13px] font-medium transition-none group border-l-2
                    ${active
                      ? 'border-primary bg-slate-100 dark:bg-slate-800 text-primary'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                >
                  <span className={`${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <>
              <div className="px-4 mb-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Administration
                </span>
              </div>
              <nav className="space-y-0.5">
                {adminItems.map((item) => {
                  const active = isActiveLink(item);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2 text-[13px] font-medium transition-none group border-l-2
                        ${active
                          ? 'border-primary bg-slate-100 dark:bg-slate-800 text-primary'
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                    >
                      <span className={`${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        {/* Sidebar Footer — User Info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-none group"
          >
            <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 rounded">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-primary transition-colors">
                {user?.name || 'User'}
              </p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}