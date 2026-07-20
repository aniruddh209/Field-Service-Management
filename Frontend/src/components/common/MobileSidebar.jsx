import { NavLink, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import BrandLogo from './BrandLogo.jsx'
import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { navigationByRole, bottomNavItems } from '../../constants/navigation.js'

// ====================================
// MobileSidebar — Role-Aware Mobile Drawer
// ====================================
//
// Uses the same navigation config as AppSidebar
// so the menu items always stay in sync.
// ====================================

function MobileSidebar({ isOpen, onClose }) {
  const location = useLocation()
  const { user } = useAuth()

  // Get navigation items for the current user's role
  const mainNavItems = user ? (navigationByRole[user.role] || []) : []

  // Close on Escape key
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="mobile-sidebar">
      {/* Dark overlay */}
      <div className="mobile-sidebar__overlay" onClick={onClose} />

      {/* Drawer */}
      <div className="mobile-sidebar__drawer">
        {/* Header */}
        <div className="mobile-sidebar__header">
          <BrandLogo />
          <button className="mobile-sidebar__close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mobile-sidebar__nav">
          <ul className="sidebar__list">
            {mainNavItems.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                    onClick={onClose}
                  >
                    <Icon size={20} className="sidebar__link-icon" />
                    <span className="sidebar__link-label">{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="mobile-sidebar__bottom">
          <ul className="sidebar__list">
            {bottomNavItems.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                    onClick={onClose}
                  >
                    <Icon size={20} className="sidebar__link-icon" />
                    <span className="sidebar__link-label">{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MobileSidebar
