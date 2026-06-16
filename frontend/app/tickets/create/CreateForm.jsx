"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import fetchClient from "../../lib/fetchClient";
import { useToast } from "../../components/Toast";

export default function CreateForm() {
  const router = useRouter();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('low');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      await fetchClient('/tickets', {
        method: 'POST',
        data: { title, body, priority },
      });

      setSuccess(true);
      showToast('Ticket created successfully!', 'success');
      
      // Delay redirection by 1.5 seconds to allow toast/state update
      setTimeout(() => {
        router.refresh();
        router.push('/tickets');
      }, 1500);

    } catch (err) {
      showToast(err.message || 'Failed to create ticket', 'error');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-md space-y-5 my-6">
      <div className="space-y-1">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Title
        </label>
        <input
          required
          type="text"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          placeholder="Enter a descriptive title..."
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-855 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[44px]"
          disabled={isLoading || success}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Body
        </label>
        <textarea
          required
          rows={5}
          onChange={(e) => setBody(e.target.value)}
          value={body}
          placeholder="Describe your issue in detail..."
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-855 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          disabled={isLoading || success}
        />
        <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-right font-bold">
          Characters: {body.length}
        </span>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Priority
        </label>
        <select
          onChange={(e) => setPriority(e.target.value)}
          value={priority}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-855 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[44px] cursor-pointer font-semibold"
          disabled={isLoading || success}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex justify-center items-center gap-2 cursor-pointer min-h-[44px]"
        disabled={isLoading || success}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating Ticket...
          </>
        ) : (
          'Submit Ticket'
        )}
      </button>
    </form>
  );
}