import { NavLink, useLocation } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import BrandLogo from './BrandLogo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { navigationByRole, bottomNavItems } from '../../constants/navigation.js'

// ====================================
// AppSidebar — Role-Aware Desktop Sidebar
// ====================================
//
// Navigation items change based on the logged-in user's role.
// The role → nav mapping lives in constants/navigation.js
// so it stays in sync with MobileSidebar.
// ====================================

function AppSidebar({ collapsed, onToggleCollapse }) {
  const location = useLocation()
  const { user } = useAuth()

  // Get navigation items for the current user's role
  const mainNavItems = user ? (navigationByRole[user.role] || []) : []

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar__header">
        <BrandLogo collapsed={collapsed} />
      </div>

      {/* Main Navigation */}
      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {mainNavItems.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={20} className="sidebar__link-icon" />
                  {!collapsed && <span className="sidebar__link-label">{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="sidebar__bottom">
        <ul className="sidebar__list">
          {bottomNavItems.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={20} className="sidebar__link-icon" />
                  {!collapsed && <span className="sidebar__link-label">{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>

        {/* Collapse Toggle */}
        <button
          className="sidebar__collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}

export default AppSidebar
