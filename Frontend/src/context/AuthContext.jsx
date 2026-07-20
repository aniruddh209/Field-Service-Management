import { createContext, useContext, useState, useEffect } from 'react'

// ====================================
// AuthContext — Temporary Demo Auth
// ====================================
//
// This provides simple demo authentication for the frontend.
//
// IMPORTANT: This is NOT real security.
// In production, this will be replaced by:
//   - ASP.NET Core Web API
//   - JWT access tokens
//   - Role-based authorization from the server
//
// The demo user is stored in localStorage so the login
// persists when you refresh the browser during development.
// No passwords are stored. No tokens are generated.
// ====================================

const AuthContext = createContext()

// Demo users — one for each role, used by the quick login feature
export const demoUsers = {
  Customer: {
    id: 1,
    firstName: 'Arjun',
    lastName: 'Mehta',
    email: 'arjun.mehta@example.com',
    phoneNumber: '9876543210',
    role: 'Customer'
  },
  Owner: {
    id: 2,
    firstName: 'Aniruddh',
    lastName: 'Parmar',
    email: 'owner@fieldservice.demo',
    phoneNumber: '9876500000',
    role: 'Owner'
  },
  Manager: {
    id: 3,
    firstName: 'Kavya',
    lastName: 'Sharma',
    email: 'manager@fieldservice.demo',
    phoneNumber: '9876500002',
    role: 'Manager'
  },
  Technician: {
    id: 4,
    firstName: 'Ravi',
    lastName: 'Kumar',
    email: 'ravi.kumar@fieldservice.demo',
    phoneNumber: '9876500001',
    role: 'Technician',
    technicianId: 1
  }
}

export function AuthProvider({ children }) {
  // Load demo user from localStorage on mount
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fieldservice-demo-user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })

  const isAuthenticated = user !== null

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('fieldservice-demo-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('fieldservice-demo-user')
    }
  }, [user])

  // Login — sets the user in state (demo only, no API call)
  // Future: POST /api/auth/login → JWT token
  const login = (userData) => {
    setUser(userData)
  }

  // Logout — clears the user
  // Future: POST /api/auth/logout → invalidate token
  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to access auth state from any component
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
