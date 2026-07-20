import { Menu, Search } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { Sun, Moon } from 'lucide-react'
import NotificationButton from './NotificationButton.jsx'
import UserMenu from './UserMenu.jsx'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

function AppHeader({ onMobileMenuOpen, pageTitle, pageSubtitle }) {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [searchValue, setSearchValue] = useState('')

  const getSearchPlaceholder = () => {
    if (!user) return 'Search...'
    const role = user.role?.toLowerCase()
    if (role === 'customer') {
      return 'Search services and requests...'
    }
    if (role === 'technician') {
      return 'Search assigned jobs...'
    }
    return 'Search requests, customers, technicians...'
  }


  return (
    <header className="app-header">
      {/* Left side */}
      <div className="app-header__left">
        {/* Mobile hamburger — only shows on small screens via CSS */}
        <button
          className="app-header__mobile-menu"
          onClick={onMobileMenuOpen}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="app-header__page-info">
          <h1 className="app-header__title">{pageTitle || 'Dashboard'}</h1>
          {pageSubtitle && (
            <p className="app-header__subtitle">{pageSubtitle}</p>
          )}
        </div>
      </div>

      {/* Center — Search */}
      <div className="app-header__center">
        <div className="app-header__search">
          <Search size={18} className="app-header__search-icon" />
          <input
            type="text"
            className="app-header__search-input"
            placeholder={getSearchPlaceholder()}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="app-header__right">
        <button
          className="app-header__icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <NotificationButton />
        <UserMenu />
      </div>
    </header>
  )
}

export default AppHeader
