"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, User as UserIcon } from 'lucide-react'
import axios from '@/lib/axios'
import {
  clearAuthSession,
  getAccessToken,
  getAuthChangeEventName,
  getRefreshToken,
} from '@/lib/auth'
import Logo from './logo.png'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsLoggedIn(Boolean(getAccessToken()))
    const syncAuthState = () => setIsLoggedIn(Boolean(getAccessToken()))
    const authEvent = getAuthChangeEventName()

    window.addEventListener(authEvent, syncAuthState)
    window.addEventListener('storage', syncAuthState)

    return () => {
      window.removeEventListener(authEvent, syncAuthState)
      window.removeEventListener('storage', syncAuthState)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout', { refreshToken: getRefreshToken() })
    } catch (_) {
      // No-op
    } finally {
      clearAuthSession()
      setIsLoggedIn(false)
      window.location.href = '/login'
    }
  }

  if (!mounted) return <nav className="h-20 bg-card border-b border-border m-0 max-w-none"></nav>

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
        <Link href="/"><h1 className="text-xl font-extrabold text-primary tracking-tight m-0">MyHelpdesk</h1></Link>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
        {isLoggedIn ? (
          <>
            <Link href="/tickets/create" className="btn-primary py-2 px-3 md:px-4 !m-0 !w-auto !text-xs md:!text-sm whitespace-nowrap">
              + New Ticket
            </Link>
            <div className="h-8 w-px bg-border mx-1 md:mx-2 hidden sm:block"></div>
            <Link href="/profile" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:ring-2 hover:ring-primary transition-all">
              <UserIcon size={20} />
            </Link>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all border-none cursor-pointer p-0" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div className="flex gap-2 md:gap-3 items-center">
            <Link href="/login" className="btn-secondary !m-0 px-3 md:px-4 text-sm md:text-base">Login</Link>
            <Link href="/signup" className="btn-primary !m-0 px-3 md:px-4 text-sm md:text-base">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
