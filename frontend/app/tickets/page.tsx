import React, { Suspense } from 'react'
import TicketList from './TicketList';
import Loading from "../loading";
import Link from 'next/link';

export default function Tickets() {
  return (
    <main>
      <nav className="flex justify-between items-center">
        <div>
          <h2>Tickets</h2>
          <p><small>Currently Open Tickets.</small></p>
        </div>
        <Link href="/tickets/create" className="btn-primary flex justify-between items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Create Ticket
        </Link>
      </nav>

      <Suspense fallback={<Loading />}>
        <TicketList />
      </Suspense>
    </main>
  )
}

