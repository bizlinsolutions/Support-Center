import React from 'react'
import CreateForm from "./CreateForm";
import Link from 'next/link';

export default function CreateTicket() {
  return (
    <main className="max-w-3xl my-8 mx-auto px-4 space-y-6">
      <div>
        <Link href="/" className="text-[13px] font-bold text-primary hover:underline flex items-center gap-1">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Add a New Ticket</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
          Describe the problem you're encountering and select the appropriate priority.
        </p>
      </div>
      
      <CreateForm />
    </main>
  );
}
