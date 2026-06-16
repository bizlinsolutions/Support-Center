"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DeleteButton from './DeleteButton';
import axios from '@/lib/axios'

export default function TicketDetails() {
  const { id } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [replying, setReplying] = useState(false)
  const [replyError, setReplyError] = useState('')

  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!replyBody.trim()) return

    setReplying(true)
    setReplyError('')
    try {
      const res = await axios.post(`/tickets/${id}/replies`, { body: replyBody })
      setTicket(res.data)
      setReplyBody('')
    } catch (err) {
      setReplyError(err.response?.data?.error || 'Unable to add reply')
    } finally {
      setReplying(false)
    }
  }

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const res = await axios.get('/tickets/' + id)
        setTicket(res.data)
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/login')
          return
        }
        if (err.response?.status === 404) {
          setError('Ticket not found')
          return
        }
        setError('Unable to load ticket')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadTicket()
    }
  }, [id, router])

  if (loading) {
    return <main><p>Loading ticket...</p></main>
  }

  if (!ticket) {
    return <main><p>{error || 'Ticket not found'}</p></main>
  }

  return (
    <main>
        <nav>
            <h2>Ticket Details</h2>
        </nav>
        <div className='card relative'>
            <div className="absolute top-4 right-4 flex flex-col items-end">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize 
                ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' : ''}
                ${ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : ''}
                ${ticket.status === 'closed' ? 'bg-gray-200 text-gray-800' : ''}
                `}>
                {ticket.status ? ticket.status.replace('_', ' ') : 'Open'}
                </span>
            </div>
            
            <h3>{ticket.title}</h3>
            <small className="block mb-1"><b>Created by: </b>{ticket.user_email}</small>
            <small className="block text-gray-500 mb-4">
              <b>Assigned To: </b> {ticket.assignedTo ? 'Support Team' : 'Unassigned'}
            </small>
            <p>{ticket.body}</p>
            <div className={`pill ${ticket.priority}`}>{ticket.priority} priority</div>
        </div>

        <div className="mt-8">
            <h4 className="text-xl font-bold mb-4">Conversation</h4>
            {ticket.replies && ticket.replies.length > 0 ? (
                ticket.replies.map((reply, idx) => (
                    <div key={idx} className={`card my-3 ${reply.sender === 'admin' ? 'border-primary border-l-4' : ''}`}>
                        <small className="text-gray-500 block mb-2">
                            <b>{reply.sender === 'admin' ? 'Support Team' : 'You'}</b> • {new Date(reply.createdAt).toLocaleString()}
                        </small>
                        <p className="m-0 whitespace-pre-wrap">{reply.body}</p>
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-500 mb-4">No replies yet. Start the conversation!</p>
            )}

            <form onSubmit={handleReplySubmit} className="mt-6">
                <label className="block mb-2 font-semibold">Add a Reply</label>
                <textarea
                    required
                    rows="4"
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Type your message here..."
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

        <div className="mt-8">
            <DeleteButton id={id} />
        </div>
    </main>
  )
}