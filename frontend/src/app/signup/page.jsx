"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import axios from '@/lib/axios'
import { setAuthSession } from '@/lib/auth'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axios.post('/auth/signup', { name, email, password })
      setAuthSession({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        user: res.data.user,
      })
      router.push('/tickets')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <label>
          <span>Name:</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          <span>Email:</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          <span>Password:</span>
          <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && <p className="text-red-500">{error}</p>}
        <center>
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        </center>
      </form>

      <center>
      <p style={{ marginTop: '1rem' }}>
        Already registered? <Link href="/login">Login</Link>
      </p>
      </center>
    </main>
  )
}
