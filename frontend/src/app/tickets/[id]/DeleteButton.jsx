"use client"
import { useRouter } from "next/navigation"
import axios from '@/lib/axios'

import React from 'react'

export default function DeleteButton({ id }) {
  const router = useRouter()

  const deleteTicket = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      await axios.delete('/tickets/' + id)
      router.push('/tickets')
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/login')
        return
      }
      console.log('Delete error:', error)
    }
  }

  return (
    <center>
        <button className="btn-secondary" onClick={deleteTicket}>Delete Ticket</button>
    </center>
  )
}
