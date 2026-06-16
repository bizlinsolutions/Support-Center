"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import fetchClient from '../lib/fetchClient';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('refreshToken='));
    const refreshToken = match ? match.split('=')[1] : null;

    try {
      if (refreshToken) {
        await fetchClient('/auth/logout', {
          method: 'POST',
          data: { refreshToken },
        });
      }
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';

      await router.push('/login');
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer text-xs"
    >
      Logout
    </button>
  );
}