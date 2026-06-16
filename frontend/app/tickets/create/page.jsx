import React from 'react'
import CreateForm from "./CreateForm";
import Link from 'next/link';

export default function CreateTicket() {
  return (
    <main className="max-w-3xl my-8 mx-auto px-4 space-y-6">
      <div>
        <Link href="/" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 min-h-[44px]">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">Add a New Ticket</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Describe the problem you're encountering and select the appropriate priority.
        </p>
      </div>
      
      <CreateForm />
    </main>
  );
}
