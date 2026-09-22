import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  getNotificationsForUser,
  markAsRead,
  markAllAsRead,
  clearNotification,
  clearAllNotifications
} from '../../services/notificationService.js'

function NotificationButton() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const dropdownRef = useRef(null)

  // Load notifications for the current user
  useEffect(() => {
    async function loadNotifications() {
      if (!user?.id) return
      try {
        const data = await getNotificationsForUser(user.id)
        setNotifications(data || [])
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }
    }
    loadNotifications()
  }, [user?.id])

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Mark a single notification as read and navigate if applicable
  async function handleNotificationClick(notification) {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id)
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        )
      } catch (err) {
        console.error('Failed to mark notification read:', err)
      }
    }

    // Navigate to the related entity based on role
    if (notification.relatedEntityType === 'ServiceRequest' && notification.relatedEntityId) {
      const role = user?.role
      if (role === 'Customer') {
        navigate(`/customer/requests/${notification.relatedEntityId}`)
      } else if (role === 'Owner' || role === 'Manager') {
        navigate(`/management/requests/${notification.relatedEntityId}`)
      } else if (role === 'Technician') {
        navigate(`/technician/jobs/${notification.relatedEntityId}`)
      }
    }
    setIsOpen(false)
  }

  // Mark all as read
  async function handleMarkAllRead() {
    if (!user?.id) return
    try {
      await markAllAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  // Clear single notification
  async function handleClearSingle(e, id) {
    e.stopPropagation()
    try {
      await clearNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Failed to clear notification:', err)
    }
  }

  // Clear all notifications
  async function handleClearAll() {
    if (!user?.id) return
    try {
      await clearAllNotifications()
      setNotifications([])
    } catch (err) {
      console.error('Failed to clear all notifications:', err)
    }
  }

  // Format relative time
  function formatRelativeTime(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now - date
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} min ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="notification-btn" ref={dropdownRef}>
      <button
        className="notification-btn__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-btn__badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-btn__dropdown">
          <div className="notification-btn__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Notifications</h4>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button
                  className="notification-btn__mark-all"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--color-primary)' }}
                >
                  <CheckCheck size={14} />
                  Read all
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="notification-btn__mark-all"
                  onClick={handleClearAll}
                  title="Clear all notifications"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--color-danger)' }}
                >
                  <Trash2 size={13} />
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="notification-btn__list">
            {notifications.length === 0 ? (
              <div className="notification-btn__empty">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 8).map(notification => (
                <div
                  key={notification.id}
                  className={`notification-btn__item ${!notification.isRead ? 'notification-btn__item--unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  role="button"
                  tabIndex={0}
                  style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                  <div className="notification-btn__item-content" style={{ flex: 1, paddingRight: 8 }}>
                    <p className="notification-btn__item-title">{notification.title}</p>
                    <p className="notification-btn__item-message">{notification.message}</p>
                    <span className="notification-btn__item-time">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {!notification.isRead && (
                      <div className="notification-btn__item-dot"></div>
                    )}
                    <button
                      onClick={(e) => handleClearSingle(e, notification.id)}
                      title="Clear notification"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyIncontent: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-btn__footer">
              <span className="notification-btn__footer-text">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationButton
