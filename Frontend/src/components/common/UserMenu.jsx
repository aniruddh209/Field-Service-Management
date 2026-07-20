import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

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

  // If no user is logged in, don't render the menu
  if (!user) return null

  // Build initials from first + last name
  const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '')
  const fullName = `${user.firstName} ${user.lastName}`

  // Handle sign out
  function handleSignOut() {
    setIsOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="user-menu" ref={dropdownRef}>
      <button
        className="user-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-menu__avatar">{initials}</div>
        <div className="user-menu__info">
          <span className="user-menu__name">{fullName}</span>
          <span className="user-menu__role">{user.role}</span>
        </div>
        <ChevronDown size={16} className={`user-menu__chevron ${isOpen ? 'user-menu__chevron--open' : ''}`} />
      </button>

      {isOpen && (
        <div className="user-menu__dropdown">
          <div className="user-menu__dropdown-header">
            <div className="user-menu__avatar user-menu__avatar--lg">{initials}</div>
            <div>
              <p className="user-menu__name">{fullName}</p>
              <p className="user-menu__role">{user.role}</p>
            </div>
          </div>

          <div className="user-menu__dropdown-divider" />

          <button className="user-menu__dropdown-item" onClick={() => { setIsOpen(false); navigate('/profile'); }}>
            <User size={16} />
            My Profile
          </button>
          <button className="user-menu__dropdown-item" onClick={() => { setIsOpen(false); navigate('/settings'); }}>
            <Settings size={16} />
            Settings
          </button>

          <div className="user-menu__dropdown-divider" />

          <button className="user-menu__dropdown-item user-menu__dropdown-item--danger" onClick={handleSignOut}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
