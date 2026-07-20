import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { KeyRound, ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import PageContainer from '../../components/layout/PageContainer.jsx'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    // Simulate API request delay
    await new Promise(r => setTimeout(r, 1000))
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifycontent: 'center',
      background: 'var(--color-bg)',
      padding: '24px'
    }}>
      <div className="data-card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--color-primary-light)', color: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <KeyRound size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Forgot Password?</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--color-success-light)', color: 'var(--color-success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle size={20} />
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              If an account exists for <strong>{email}</strong>, we have sent password reset instructions.
            </p>
            <button className="btn btn--primary btn--full" onClick={() => navigate('/login')}>
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="enter your email..."
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn--primary btn--full" disabled={isLoading} style={{ marginTop: 16 }}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link to="/login" style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage
