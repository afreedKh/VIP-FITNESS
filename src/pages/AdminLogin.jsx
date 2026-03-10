import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const [pw, setPw]       = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (login(pw)) {
        navigate('/admin')
      } else {
        setError('Incorrect password. Try again.')
        setPw('')
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={{ color: '#FF4400' }}>VIP</span>
          <span style={{ color: '#fff' }}>FITNESS</span>
        </div>
        <h2 style={styles.title}>Admin Access</h2>
        <p style={styles.sub}>Enter your admin password to continue</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="Admin password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError('') }}
            style={styles.input}
            autoFocus
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Verifying...' : 'Login →'}
          </button>
        </form>
        <a href="/" style={styles.back}>← Back to site</a>
      </div>
    </div>
  )
}

const styles = {
  page:  { minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card:  { background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', padding: '3rem 2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center' },
  logo:  { fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' },
  title: { fontFamily: "'Oswald', sans-serif", fontSize: '1.4rem', textTransform: 'uppercase', color: '#fff', marginBottom: '0.5rem' },
  sub:   { color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: '2rem' },
  form:  { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { background: '#121212', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 0, color: '#fff', padding: '0.85rem 1rem', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', width: '100%' },
  error: { color: '#ef4444', fontSize: '0.8rem', margin: 0 },
  btn:   { fontFamily: "'Oswald', sans-serif", background: '#FF4400', color: '#fff', border: 'none', padding: '0.9rem', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.2s' },
  back:  { display: 'block', marginTop: '1.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textDecoration: 'none' },
}
