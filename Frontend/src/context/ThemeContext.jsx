import { createContext, useContext, useState, useEffect } from 'react'

// 1. Create context
const ThemeContext = createContext()

// 2. Provider component — wraps the app
export function ThemeProvider({ children }) {
  // Check localStorage first, otherwise default to 'dark'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('fieldservice-theme')
    return saved || 'dark'
  })

  // When theme changes, update the HTML attribute and save to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('fieldservice-theme', theme)
  }, [theme])

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 3. Custom hook — use this in any component to get theme info
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}
