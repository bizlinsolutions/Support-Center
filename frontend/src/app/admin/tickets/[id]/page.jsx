"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import adminAxios from '@/lib/adminAxios';
import { getAdminAccessToken, getAdminUser } from '@/lib/adminAuth';

export default function AdminTicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Status & Assign state
  const [statusLoading, setStatusLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  // Reply state
  const [replyBody, setReplyBody] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState('');

  // Super admin state
  const [adminList, setAdminList] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (!getAdminAccessToken()) {
      router.push('/admin/login');
      return;
    }

    const loadTicketAndAdmins = async () => {
      try {
        const adminUser = getAdminUser();
        if (adminUser?.email === 'admin@helpdesk.com') {
          setIsSuperAdmin(true);
          try {
            const adminRes = await adminAxios.get('/admin/list-admins');
            setAdminList(adminRes.data);
          } catch (err) {
            console.error('Failed to load admins', err);
          }
        }

        const res = await adminAxios.get(`/admin/tickets/${id}`);
        setTicket(res.data);
        setTitle(res.data.title);
        setBody(res.data.body);
        setPriority(res.data.priority);
        setStatus(res.data.status || 'open');
        setAssignedTo(res.data.assignedTo || null);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/admin/login');
          return;
        }
        if (err.response?.status === 404) {
          setError('Ticket not found');
          return;
        }
        setError('Unable to load ticket');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTicketAndAdmins();
    }
  }, [id, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaveLoading(true);

    try {
      const res = await adminAxios.put(`/admin/tickets/${ticket._id}`, {
        title,
        body,
        priority,
      });
      setTicket(res.data);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update ticket');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    setError('');
    setSaveLoading(true);

    try {
      await adminAxios.delete(`/admin/tickets/${ticket._id}`);
      router.push('/admin/tickets'); // Navigate back after deletion
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete ticket');
      setSaveLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    setReplying(true);
    setReplyError('');
    try {
      const res = await adminAxios.post(`/admin/tickets/${ticket._id}/replies`, { body: replyBody });
      setTicket(res.data);
      setReplyBody('');
    } catch (err) {
      setReplyError(err.response?.data?.error || 'Unable to add reply');
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    setError('');
    try {
      const res = await adminAxios.patch(`/admin/tickets/${ticket._id}/status`, { status: newStatus });
      setTicket(res.data);
      setStatus(res.data.status);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAssignAdmin = async (newAdminId) => {
    setAssignLoading(true);
    setError('');
    try {
      const res = await adminAxios.patch(`/admin/tickets/${ticket._id}/assign`, { adminId: newAdminId });
      setTicket(res.data);
      setAssignedTo(res.data.assignedTo);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to assign admin');
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return <main><p>Loading ticket...</p></main>;
  }

  if (error || !ticket) {
    return (
      <main>
        <p className="text-red-500">{error || 'Ticket not found'}</p>
        <button className="btn-primary mt-4" onClick={() => router.back()}>Go Back</button>
      </main>
    );
  }

  return (
    <main>
      <nav>
        <h2>Ticket Details</h2>
      </nav>

      <button className="text-sm text-gray-600 underline mb-4 inline-block hover:text-gray-900" onClick={() => router.back()}>
        &larr; Back
      </button>

      {editing ? (
        <div className="card my-5">
          <form onSubmit={handleSave}>
            <label>
              <span>Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              <span>Body</span>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} required />
            </label>
            <label>
              <span>Priority</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            {error && <p className="text-red-500">{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={saveLoading}>
                {saveLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setTitle(ticket.title);
                  setBody(ticket.body);
                  setPriority(ticket.priority);
                  setEditing(false);
                  setError('');
                }}
                disabled={saveLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card my-5 relative">
          <div className="absolute top-4 right-4 flex flex-col items-end">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize 
              ${status === 'open' ? 'bg-blue-100 text-blue-800' : ''}
              ${status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${status === 'resolved' ? 'bg-green-100 text-green-800' : ''}
              ${status === 'closed' ? 'bg-gray-200 text-gray-800' : ''}
            `}>
              {status.replace('_', ' ')}
            </span>
          </div>

          <h3>{ticket.title}</h3>
          <small className="block text-gray-500 mb-2"><b>User Email:</b> {ticket.user_email}</small>
          <small className="block text-gray-500 mb-4">
            <b>Assigned To:</b> {assignedTo ? (assignedTo.name || assignedTo) : 'Unassigned'}
          </small>
          <p>{ticket.body}</p>
          <div className={`pill ${ticket.priority}`}>{ticket.priority} priority</div>

          {error && <p className="text-red-500 mt-2">{error}</p>}

          <div className="border-t border-gray-200 mt-6 pt-4">
            <h4 className="text-lg font-semibold mb-3">Admin Controls</h4>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select 
                  value={status} 
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusLoading}
                  className="border rounded px-2 py-1 text-sm focus:ring-primary focus:border-primary"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                {statusLoading && <span className="text-xs text-gray-400">Updating...</span>}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Assignment:</label>
                {isSuperAdmin ? (
                  <select
                    value={assignedTo?._id || assignedTo || ''}
                    onChange={(e) => handleAssignAdmin(e.target.value)}
                    disabled={assignLoading}
                    className="border rounded px-2 py-1 text-sm focus:ring-primary focus:border-primary"
                  >
                    <option value="">Unassigned</option>
                    {adminList.map(admin => (
                      <option key={admin._id} value={admin._id}>{admin.name} ({admin.email})</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-gray-600">{assignedTo ? (assignedTo.name || assignedTo) : 'Unassigned'}</span>
                )}
                {assignLoading && <span className="text-xs text-gray-400">Updating...</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn-primary" onClick={() => setEditing(true)} disabled={saveLoading}>
              Edit Ticket Details
            </button>
            <button className="btn-secondary" onClick={handleDelete} disabled={saveLoading}>
              {saveLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Replies Section */}
      <div className="mt-8">
        <h4 className="text-xl font-bold mb-4">Conversation</h4>
        {ticket.replies && ticket.replies.length > 0 ? (
          ticket.replies.map((reply, idx) => (
            <div key={idx} className={`card ${reply.sender === 'admin' ? 'border-primary border-l-4 shadow-sm' : 'border-gray-200'}`}>
              <small className="text-gray-500 block mb-2">
                <b>{reply.sender === 'admin' ? `You (${reply.sender_email})` : 'User'}</b> • {new Date(reply.createdAt).toLocaleString()}
              </small>
              <p className='text-sm text-gray-500 mb-4'>{reply.body}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 mb-4">No replies yet.</p>
        )}

        <form onSubmit={handleReplySubmit} className="mt-6 bg-white p-4 rounded-md border border-gray-100 shadow-sm">
          <label className="block mb-2 font-semibold">Add a Reply</label>
          <textarea
            required
            rows="3"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type your message to the user..."
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            disabled={replying}
          ></textarea>
          {replyError && <p className="text-red-500 mt-2">{replyError}</p>}
          <button type="submit" className="btn-primary mt-3" disabled={replying}>
            {replying ? 'Sending...' : 'Send Reply'}
          </button>
        </form>
      </div>
    </main>
  );
}
