"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

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
        <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      label: 'My Tickets',
      href: '/tickets',
      icon: (
        <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      label: 'New Ticket',
      href: '/tickets/create',
      icon: (
        <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: (
        <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const adminItems = [
    {
      label: 'Manage Users',
      href: '/admin/users',
      icon: (
        <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: (
        <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-950 border-r border-slate-800/70 flex flex-col transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-[220px]
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-800/70 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-sm shadow-md flex-shrink-0">
            D
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">
            DeskFlow
          </span>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
          {/* Section Label */}
          <div className="px-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Main
            </span>
          </div>

          {/* Main Nav Items */}
          <nav className="space-y-0.5 mb-6">
            {navItems.map((item) => {
              const active = isActiveLink(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group
                    ${active
                      ? 'bg-primary/15 text-primary border-l-0'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <span className={`${active ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <>
              <div className="px-2 mb-2 pt-2 border-t border-slate-800/60">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Admin
                </span>
              </div>
              <nav className="space-y-0.5">
                {adminItems.map((item) => {
                  const active = isActiveLink(item);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group
                        ${active
                          ? 'bg-primary/15 text-primary'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                    >
                      <span className={`${active ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        {/* Sidebar Footer — User Info */}
        <div className="p-3 border-t border-slate-800/70 flex-shrink-0">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-slate-800/60 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.role === 'admin' ? 'Administrator' : 'Member'}
              </p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}