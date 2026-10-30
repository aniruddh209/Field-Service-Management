import React, { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { User, Phone, Mail, Camera, Trash2, Check, AlertCircle } from 'lucide-react'
import PageContainer from '../../components/layout/PageContainer.jsx'
import api from '../../api/api.js'

function ProfilePage() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [profileImage, setProfileImage] = useState(user?.profileImage || '')
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || user?.phone || ''
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5179/api').replace('/api', '')

  const getImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    return `${apiBase}/${path}`
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds 15MB limit.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setIsUploading(true)
      setErrorMsg('')

      const response = await api.post('/Users/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const newPath = response.data?.profileImage || response.data?.data?.profileImage
      if (newPath) {
        setProfileImage(newPath)

        // Update stored user
        const storedUser = JSON.parse(localStorage.getItem('authUser') || '{}')
        storedUser.profileImage = newPath
        localStorage.setItem('authUser', JSON.stringify(storedUser))
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error('Failed to upload profile image:', err)
      const msg = err.response?.data?.message || err.message || 'Failed to upload profile image.'
      setErrorMsg(msg)
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDeleteImage() {
    if (!user?.id) return
    try {
      setIsUploading(true)
      setErrorMsg('')
      await api.delete(`/Users/${user.id}?deleteFileOnly=true`)

      setProfileImage('')
      const storedUser = JSON.parse(localStorage.getItem('authUser') || '{}')
      storedUser.profileImage = null
      localStorage.setItem('authUser', JSON.stringify(storedUser))

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to delete profile image:', err)
      setErrorMsg('Failed to delete image.')
    } finally {
      setIsUploading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">My Profile</h1>
          <p className="page-header__subtitle">Manage your account details and profile picture</p>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          padding: '12px 16px', background: 'var(--color-danger-light)', border: '1px solid var(--color-danger)',
          borderRadius: 8, color: 'var(--color-danger)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, alignItems: 'start' }}>
        {/* Left Card: Avatar & Summary */}
        <div className="data-card" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 16px' }}>
            {profileImage ? (
              <img
                src={getImageUrl(profileImage)}
                alt={`${user?.firstName} ${user?.lastName}`}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'var(--color-primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '2.2rem'
              }}>
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {/* Upload Button overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Upload Profile Picture"
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 32, height: 32, borderRadius: '50%',
                backgroundColor: 'var(--color-primary)', color: '#fff',
                border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              <Camera size={16} />
            </button>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{user?.firstName} {user?.lastName}</h3>
          <span className="badge badge--completed" style={{ marginTop: 6 }}>{user?.role}</span>
          
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            <button
              className="btn btn--outline btn--sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera size={14} style={{ marginRight: 4 }} /> {isUploading ? 'Uploading...' : 'Change Photo'}
            </button>
            {profileImage && (
              <button
                className="btn btn--ghost btn--sm"
                style={{ color: 'var(--color-danger)' }}
                onClick={handleDeleteImage}
                disabled={isUploading}
                title="Remove Photo"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right Card: Profile Details */}
        <div className="data-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Profile Information</h3>
          {saved && (
            <div style={{
              background: 'var(--color-success-light)', color: 'var(--color-success)',
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6
            }}>
              <Check size={16} /> Profile updated successfully!
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
