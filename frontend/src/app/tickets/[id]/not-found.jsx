import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className='text-center'>
        <center>
            <h1>Error!</h1>
            <p>We could not find the ticket you were looking for.</p>
            <p><small>Go back to all <Link href='/tickets'>tickets</Link>.</small></p>
        </center>
    </main>
  )
}
