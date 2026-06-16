"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import axios from '@/lib/axios'
import { setAuthSession } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axios.post('/auth/login', { email, password })
      setAuthSession({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        user: res.data.user,
      })
      router.push('/tickets')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          <span>Email:</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          <span>Password:</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && <p className="text-red-500">{error}</p>}
        <center>
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        </center>
      </form>

      <center>
      <p style={{ marginTop: '1rem' }}>
        New here? <Link href="/signup">Create an account</Link>
      </p>
      </center>
    </main>
  )
}
