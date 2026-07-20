import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  getNotificationsForUser,
  markAsRead,
  markAllAsRead
} from '../../services/notificationService.js'

// ====================================
// NotificationButton — User-Specific Notifications
// ====================================
//
// PRIVACY FIX: Notifications are filtered by userId.
// Each user only sees their own notifications.
//
// Customer → their request updates only
// Owner/Manager → business-wide operational alerts
// Technician → their job assignments only
//
// ====================================

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
      const data = await getNotificationsForUser(user.id)
      setNotifications(data)
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
      await markAsRead(notification.id)
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      )
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
    await markAllAsRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
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
          <div className="notification-btn__header">
            <h4>Notifications</h4>
            {unreadCount > 0 ? (
              <button
                className="notification-btn__mark-all"
                onClick={handleMarkAllRead}
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            ) : (
              <span className="notification-btn__count">All read</span>
            )}
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
                >
                  <div className="notification-btn__item-content">
                    <p className="notification-btn__item-title">{notification.title}</p>
                    <p className="notification-btn__item-message">{notification.message}</p>
                    <span className="notification-btn__item-time">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <div className="notification-btn__item-dot"></div>
                  )}
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
