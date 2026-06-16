"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import AdminNavbar from './AdminNavbar';

export default function NavWrapper() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <AdminNavbar />;
  }

  return <Navbar />;
}
