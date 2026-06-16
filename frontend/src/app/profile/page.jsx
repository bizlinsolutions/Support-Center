"use client"
import React, { useEffect, useState } from 'react'
import { getAuthUser } from '@/lib/auth'
import { User, Mail, ShieldCheck, Ticket } from 'lucide-react'
import axios from '@/lib/axios'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(true)

  useEffect(() => {
    setMounted(true)
    const userData = getAuthUser()
    setUser(userData)
    
    if (userData) {
      const fetchTickets = async () => {
        try {
          const res = await axios.get('/tickets')
          setTickets(res.data)
        } catch (error) {
          console.error("Failed to fetch tickets", error)
        } finally {
          setLoadingTickets(false)
        }
      }
      fetchTickets()
    }
  }, [])

  if (!mounted) return null

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-bold mb-2">Not Logged In</h2>
        <p className="text-slate-500">Please log in to view your profile.</p>
      </div>
    )
  }

  const priorityCounts = {
    high: tickets.filter(t => t.priority === 'high').length,
    medium: tickets.filter(t => t.priority === 'medium').length,
    low: tickets.filter(t => t.priority === 'low').length,
    total: tickets.length
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 text-foreground">My Profile</h1>
        <p className="text-foreground/50">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-indigo-500"></div>
        <div className="px-8 pb-8 relative">
          <div className="w-24 h-24 bg-card rounded-full border-4 border-card flex items-center justify-center -mt-12 mb-4 shadow-md">
            <User size={40} className="text-foreground/50" />
          </div>
          
          <h2 className="text-2xl font-bold mb-1 text-foreground">{user.name || 'User'}</h2>
          <div className="flex items-center gap-2 text-foreground/60 mb-6">
            <Mail size={16} />
            <span>{user.email}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-3">Account Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Role</div>
                    <div className="text-xs text-foreground/60 capitalize">{user.role || 'User'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-3">Ticket Statistics</h3>
              {loadingTickets ? (
                <div className="text-sm text-foreground/50 animate-pulse">Loading tickets...</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-foreground">
                      <Ticket size={16} className="text-primary" />
                      <span className="text-sm font-medium">Total Tickets</span>
                    </div>
                    <span className="font-bold text-foreground">{priorityCounts.total}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">High</span>
                      <span className="text-lg font-bold text-red-700 dark:text-red-300">{priorityCounts.high}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Medium</span>
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{priorityCounts.medium}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Low</span>
                      <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{priorityCounts.low}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
