import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { Moon, Sun, Bell, Shield, Eye } from 'lucide-react'
import PageContainer from '../../components/layout/PageContainer.jsx'

function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true
  })
  const [saved, setSaved] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">Settings</h1>
          <p className="page-header__subtitle">Configure preferences and system options</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Appearance Settings */}
        <div className="data-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={18} /> Appearance Theme
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            Choose between dark mode or light mode layout.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className={`btn ${theme === 'light' ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setTheme('light')}
            >
              <Sun size={16} /> Light Theme
            </button>
            <button
              className={`btn ${theme === 'dark' ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setTheme('dark')}
            >
              <Moon size={16} /> Dark Theme (Premium Black)
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="data-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} /> Notifications
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            Toggle channels where you wish to receive updates.
          </p>
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={e => setNotifications({ ...notifications, email: e.target.checked })}
                />
                Email Alerts (for new request assignments and updates)
              </label>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={e => setNotifications({ ...notifications, sms: e.target.checked })}
                />
                SMS Notifications (for field status updates)
              </label>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={e => setNotifications({ ...notifications, push: e.target.checked })}
                />
                In-app Push Notifications (dropdown list alerts)
              </label>
            </div>
            <button type="submit" className="btn btn--primary">
              {saved ? 'Preferences Saved!' : 'Save Preferences'}
            </button>
          </form>
        </div>
      </div>
    </PageContainer>
  )
}

export default SettingsPage
