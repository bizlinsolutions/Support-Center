"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
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

    const savedCollapse = localStorage.getItem('sidebar-collapsed');
    setIsCollapsed(savedCollapse === 'true');
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

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar-collapsed', String(nextState));
    window.dispatchEvent(new CustomEvent('sidebar-collapsed-change', { detail: nextState }));
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      label: 'My Tickets',
      href: '/tickets',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Create Ticket',
      href: '/tickets/create',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const adminItems = [
    {
      label: 'Users',
      href: '/admin/users',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      )
    }
  ];

  const allItems = [...navItems, ...adminItems];

  const renderNavLinks = (items) => {
    return items.map((item) => {
      const isActive =
        pathname === item.href ||
        (item.href !== '/' &&
          pathname.startsWith(item.href) &&
          // Only active if no other nav item is a longer (more specific) match
          !allItems.some(
            (other) =>
              other.href !== item.href &&
              other.href.length > item.href.length &&
              pathname.startsWith(other.href)
          ));
      return (
        <Link
          key={item.label}
          href={item.href}
          className={`flex items-center rounded-lg text-sm font-semibold transition-all group relative cursor-pointer min-h-[44px] ${
            isCollapsed
              ? 'justify-center p-2'
              : 'gap-3 px-3 py-2.5'
          } ${
            isActive
              ? 'bg-primary/10 text-primary dark:bg-primary/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {item.icon}
          {!isCollapsed && (
            <span className="transition-opacity duration-200">{item.label}</span>
          )}
          {isActive && !isCollapsed && (
            <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
          {isCollapsed && (
            <div className="absolute left-16 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 whitespace-nowrap">
              {item.label}
            </div>
          )}
        </Link>
      );
    });
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
        className={`fixed top-16 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 overflow-x-hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-[60px]' : 'w-60'}
        `}
      >
        <div className={`flex-1 py-4 ${isCollapsed ? 'px-2' : 'px-3'} space-y-6 overflow-y-auto overflow-x-hidden`}>
          {/* Main Links */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Main Menu
              </span>
            )}
            {renderNavLinks(navItems)}
          </div>

          {/* Admin Links */}
          {user?.role === 'admin' && (
            <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Administration
                </span>
              )}
              {renderNavLinks(adminItems)}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className={`p-3 border-t border-slate-200 dark:border-slate-800 flex flex-col ${isCollapsed ? 'items-center gap-4' : 'gap-3'}`}>
          {/* User Info */}
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center px-0' : 'px-2 py-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl'}`}>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
              {getInitials(user?.name)}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role}</p>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex items-center justify-center w-full py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer min-h-[44px]"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}