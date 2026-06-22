"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/login/admin' || pathname === '/signup';

  // Check user on route change
  useEffect(() => {
    const checkUser = () => {
      const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user='));
      setHasUser(!!match);
    };
    checkUser();
  }, [pathname]);

  // Read initial collapse state once on mount
  useEffect(() => {
    const savedCollapse = localStorage.getItem('sidebar-collapsed');
    setIsCollapsed(savedCollapse === 'true');
  }, []);

  // Listen for sidebar collapse events — stable listener, not tied to pathname
  useEffect(() => {
    const handleCollapseChange = (e) => {
      setIsCollapsed(e.detail);
    };
    window.addEventListener('sidebar-collapsed-change', handleCollapseChange);
    return () => {
      window.removeEventListener('sidebar-collapsed-change', handleCollapseChange);
    };
  }, []);

  const showSidebar = !isAuthPage && hasUser;

  return (
    <div
      className={`flex-1 min-h-screen pt-16 flex flex-col transition-all duration-300 ${
        showSidebar ? 'md:pl-[220px]' : 'pl-0'
      }`}
    >
      {children}
    </div>
  );
}
