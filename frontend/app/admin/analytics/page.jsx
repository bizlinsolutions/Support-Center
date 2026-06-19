"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/Toast';
import fetchClient from '../../lib/fetchClient';

// ─── Helper: get week boundaries ─────────────────────────────
function getWeekBounds(offsetWeeks = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

// ─── Mini bar component ───────────────────────────────────────
function Bar({ label, value, max, color, sublabel }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[160px]" title={label}>
          {label}
        </span>
        <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 ml-2 flex-shrink-0">
          {value}
          {sublabel && <span className="text-slate-400 font-normal ml-1">{sublabel}</span>}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
        <div
          className={`h-full rounded-sm ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-white">
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-slate-500 mt-1 font-medium">
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ tickets: [], users: [] });

  useEffect(() => {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user='));
    const userCookie = match ? match.split('=')[1] : null;
    let currentUser = null;
    if (userCookie) {
      try {
        currentUser = JSON.parse(decodeURIComponent(userCookie));
      } catch (e) {
        currentUser = null;
      }
    }

    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Unauthorized access', 'error');
      router.push('/');
      return;
    }

    const fetchAnalyticsData = async () => {
      try {
        const dashboardData = await fetchClient('/dashboard');
        setData({
          tickets: dashboardData.tickets || [],
          users: dashboardData.users || [],
        });
      } catch (err) {
        showToast(err.message || 'Failed to fetch analytics data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <main>
        <div className="text-center py-16">
          <svg className="animate-spin h-6 w-6 text-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 text-[13px] font-semibold">Loading analytics data...</p>
        </div>
      </main>
    );
  }

  const { tickets, users } = data;

  // ── 1. Tickets created per user ──────────────────────────────
  // Build a lookup map: email → user name
  const userMap = {};
  for (const u of users) {
    userMap[u.email] = u.name || u.email;
  }

  const ticketsPerUser = {};
  for (const t of tickets) {
    const email = t.user_email || 'Unknown';
    const name  = userMap[email] || email;
    if (!ticketsPerUser[email]) ticketsPerUser[email] = { name, email, count: 0 };
    ticketsPerUser[email].count++;
  }
  const userTicketList = Object.values(ticketsPerUser)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxUserTickets = userTicketList[0]?.count || 1;
  const topUser = userTicketList[0];

  // ── 2. Ticket resolution rate (closed vs open) ───────────────
  const totalTickets   = tickets.length;
  const closedTickets  = tickets.filter(t => t.status === 'closed').length;
  const openTickets    = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in progress').length;
  const resolutionRate = totalTickets === 0 ? 0 : Math.round((closedTickets / totalTickets) * 100);

  // ── 3. Most common priority ──────────────────────────────────
  const priorityCounts = { high: 0, medium: 0, low: 0 };
  for (const t of tickets) {
    if (t.priority in priorityCounts) priorityCounts[t.priority]++;
  }
  const dominantPriority = Object.entries(priorityCounts).sort((a, b) => b[1] - a[1])[0];
  const maxPriority = Math.max(...Object.values(priorityCounts), 1);
  const priorityColors = { high: 'bg-rose-500', medium: 'bg-amber-500', low: 'bg-emerald-500' };
  const priorityTextColors = {
    high:   'text-rose-600',
    medium: 'text-amber-600',
    low:    'text-emerald-600',
  };

  // ── 4. Oldest open tickets ───────────────────────────────────
  const now = new Date();
  const openList = tickets
    .filter(t => t.status === 'open' || t.status === 'in progress')
    .map(t => {
      const created = new Date(t.createdAt || t.created_at || 0);
      const ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      return { ...t, ageDays };
    })
    .sort((a, b) => b.ageDays - a.ageDays)
    .slice(0, 6);
  const maxAge = openList[0]?.ageDays || 1;

  // ── 5. Tickets this week vs last week ────────────────────────
  const thisWeek = getWeekBounds(0);
  const lastWeek = getWeekBounds(-1);
  const thisWeekCount = tickets.filter(t => {
    const d = new Date(t.createdAt || t.created_at || 0);
    return d >= thisWeek.start && d <= thisWeek.end;
  }).length;
  const lastWeekCount = tickets.filter(t => {
    const d = new Date(t.createdAt || t.created_at || 0);
    return d >= lastWeek.start && d <= lastWeek.end;
  }).length;
  const weekDelta = thisWeekCount - lastWeekCount;
  const weekPct   = lastWeekCount === 0 ? null : Math.round(Math.abs(weekDelta / lastWeekCount) * 100);

  // ── Priority label helper ────────────────────────────────────
  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  return (
    <main className="max-w-6xl my-8 mx-auto px-4 space-y-6">

      {/* ─ Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
          Key insights from your helpdesk data — updated in real time.
        </p>
      </div>

      {/* ─ Top KPI strip ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tickets"
          value={totalTickets}
          sub={`${openTickets} open · ${inProgressTickets} in progress`}
          icon={
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Resolution Rate"
          value={`${resolutionRate}%`}
          sub={`${closedTickets} of ${totalTickets} closed`}
          icon={
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Top Priority"
          value={dominantPriority ? capitalize(dominantPriority[0]) : '—'}
          sub={dominantPriority ? `${dominantPriority[1]} tickets (${Math.round(dominantPriority[1] / Math.max(totalTickets,1) * 100)}%)` : ''}
          icon={
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          label="This Week"
          value={thisWeekCount}
          sub={
            weekPct !== null
              ? weekDelta >= 0
                ? `↑ ${weekPct}% vs last week`
                : `↓ ${weekPct}% vs last week`
              : `${lastWeekCount} last week`
          }
          icon={
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* ─ Main content grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── 1. Tickets per user ──────────────────────────────── */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Tickets per User
            </h3>
            {topUser && (
              <span className="text-[11px] text-slate-500 font-bold">
                Top: {topUser.name.split(' ')[0]}
              </span>
            )}
          </div>

          {userTicketList.length === 0 ? (
            <p className="text-[13px] text-slate-400 text-center py-6">No ticket data yet.</p>
          ) : (
            <div className="space-y-3">
              {userTicketList.map((u) => (
                <Bar
                  key={u.email}
                  label={u.name || u.email}
                  value={u.count}
                  max={maxUserTickets}
                  color="bg-primary"
                  sublabel={u.count === 1 ? 'ticket' : 'tickets'}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── 2. Resolution rate ───────────────────────────────── */}
        <div className="card">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resolution Rate
          </h3>

          {/* Big donut-style number */}
          <div className="flex items-center justify-center my-4">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-slate-800" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="currentColor" strokeWidth="10"
                  strokeLinecap="butt"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - resolutionRate / 100)}`}
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800 dark:text-white">{resolutionRate}%</span>
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">resolved</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-2">
            <Bar label="Closed" value={closedTickets} max={totalTickets || 1} color="bg-emerald-500" />
            <Bar label="Open"   value={openTickets}   max={totalTickets || 1} color="bg-amber-500" />
            <Bar label="In Progress" value={inProgressTickets} max={totalTickets || 1} color="bg-primary" />
          </div>

          <p className="text-[11px] text-slate-500 mt-4 text-center">
            {openTickets} ticket{openTickets !== 1 ? 's' : ''} still open · {totalTickets} total
          </p>
        </div>

        {/* ── 3. Most common priority ──────────────────────────── */}
        <div className="card">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Priority Breakdown
          </h3>

          <div className="space-y-4">
            {[
              { key: 'high',   label: 'High',   color: 'bg-rose-500' },
              { key: 'medium', label: 'Medium', color: 'bg-amber-500' },
              { key: 'low',    label: 'Low',    color: 'bg-emerald-500' },
            ].map(({ key, label, color }) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${priorityTextColors[key]}`}>
                      {label}
                    </span>
                    {dominantPriority?.[0] === key && (
                      <span className="text-[11px] text-slate-400">← most common</span>
                    )}
                  </span>
                  <span className="text-[13px] font-bold text-slate-800 dark:text-white">
                    {priorityCounts[key]}
                    <span className="text-slate-400 font-normal ml-1">
                      ({totalTickets === 0 ? 0 : Math.round(priorityCounts[key] / totalTickets * 100)}%)
                    </span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-sm`}
                    style={{ width: `${maxPriority === 0 ? 0 : Math.round(priorityCounts[key] / maxPriority * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Oldest open tickets ───────────────────────────── */}
        <div className="card">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Oldest Open Tickets
          </h3>

          {openList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-slate-500 font-semibold">No open tickets — all resolved!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openList.map((t, i) => {
                const ageColor =
                  t.ageDays >= 14 ? 'text-rose-600' :
                  t.ageDays >= 7  ? 'text-amber-600' :
                                    'text-slate-500';
                const barColor =
                  t.ageDays >= 14 ? 'bg-rose-500' :
                  t.ageDays >= 7  ? 'bg-amber-500' :
                                    'bg-slate-400';
                return (
                  <div key={t.publicId || i} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate">{t.title || t.subject || 'Untitled'}</p>
                      <div className="mt-1 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-sm`}
                          style={{ width: `${Math.round(t.ageDays / maxAge * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-[13px] font-bold flex-shrink-0 ${ageColor}`}>
                      {t.ageDays === 0 ? 'today' : `${t.ageDays}d`}
                    </span>
                  </div>
                );
              })}
              <p className="text-[11px] text-slate-400 mt-2">Age in days since ticket was created.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. This week vs last week ─────────────────────────── */}
      <div className="card">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-6">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Tickets Created: This Week vs Last Week
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* This week */}
          <div className="flex flex-col items-center justify-center py-6 bg-background border border-border-color rounded-md">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">This Week</span>
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{thisWeekCount}</span>
            <span className="text-[11px] text-slate-400 mt-1">tickets</span>
          </div>

          {/* Last week */}
          <div className="flex flex-col items-center justify-center py-6 bg-background border border-border-color rounded-md">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Last Week</span>
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{lastWeekCount}</span>
            <span className="text-[11px] text-slate-400 mt-1">tickets</span>
          </div>
        </div>

        {/* Delta banner */}
        <div className={`mt-4 flex items-center justify-center gap-2 py-2 rounded-md text-[13px] font-bold border ${
          weekDelta > 0
            ? 'border-rose-200 dark:border-rose-800/30 text-rose-600'
            : weekDelta < 0
            ? 'border-emerald-200 dark:border-emerald-800/30 text-emerald-600'
            : 'border-border-color text-slate-500'
        }`}>
          {weekDelta === 0
            ? 'Same volume as last week'
            : weekDelta > 0
            ? `${weekDelta} more ticket${weekDelta !== 1 ? 's' : ''} than last week${weekPct !== null ? ` (↑ ${weekPct}%)` : ''}`
            : `${Math.abs(weekDelta)} fewer ticket${Math.abs(weekDelta) !== 1 ? 's' : ''} than last week${weekPct !== null ? ` (↓ ${weekPct}%)` : ''}`
          }
        </div>
      </div>
    </main>
  );
}
