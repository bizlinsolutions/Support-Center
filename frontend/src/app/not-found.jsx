import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className='text-center'>
        <center>
            <h1>There was a problem</h1>
            <p>We could not find the page you were looking for.</p>
            <p><small>Go back to <Link href='/'>Dashboard</Link></small></p>
        </center>
    </main>
  )
}
