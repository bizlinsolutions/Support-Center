"use client"            //Use as client component
import React from 'react'
import axios from '@/lib/axios'

import { useRouter } from 'next/navigation'             //To re-route after submission
import { useState } from 'react'                        //For default values

export default function CreateForm() {
  const router = useRouter();

  const[title, setTitle] = useState('');
  const[body, setBody] = useState('');
  const[priority, setPriority] = useState('low');
  const[loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e)  => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const newTicket = { title, body, priority }

    try {
      const res = await axios.post('/tickets', newTicket)
      if (res.status === 201) {
        router.refresh()
        router.push('/tickets')
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/login')
      } else {
        setError(err.response?.data?.error || 'Unable to create ticket')
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <span>Title:</span>
        <input
          required 
          type="text"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
      </label>
      <label>
        <span>Body:</span>
        <textarea
          required
          onChange={(e) => setBody(e.target.value)}
          value={body}
        />
      </label>
      <label>
        <span>Priority:</span>
        <select 
          onChange={(e) => setPriority(e.target.value)}
          value={priority}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </label>
      {error && <p className='text-red-500'>{error}</p>}
      <center>
      <button 
        className="btn-primary" 
        disabled={loading}>
      {loading && <span>Adding...</span>}
      {!loading && <span>Add Ticket</span>}
    </button>
    </center>
    </form>
)
}
