import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { User, Phone, Mail, Award, Check } from 'lucide-react'
import PageContainer from '../../components/layout/PageContainer.jsx'

function ProfilePage() {
  const { user, login } = useAuth()
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || ''
  })
  const [saved, setSaved] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    // Simulated save
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">My Profile</h1>
          <p className="page-header__subtitle">Manage your personal account details</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, alignItems: 'start' }}>
        {/* Left Card: Summary */}
        <div className="data-card" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--color-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '1.8rem', margin: '0 auto 16px'
          }}>
            {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{user?.firstName} {user?.lastName}</h3>
          <span className="badge badge--completed" style={{ marginTop: 6 }}>{user?.role}</span>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', marginTop: 12 }}>
            Member since July 2026
          </p>
        </div>

        {/* Right Card: Profile Form */}
        <div className="data-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Profile Information</h3>
          {saved && (
            <div style={{
              background: 'var(--color-success-light)', color: 'var(--color-success)',
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6
            }}>
              <Check size={16} /> Changes saved successfully (demo)!
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={form.phoneNumber}
                onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>
            <div className="form-actions" style={{ borderTop: 'none', padding: 0, marginTop: 12 }}>
              <button type="submit" className="btn btn--primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  )
}

export default ProfilePage
