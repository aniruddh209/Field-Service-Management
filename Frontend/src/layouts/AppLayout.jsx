import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AppSidebar from '../components/common/AppSidebar.jsx'
import AppHeader from '../components/common/AppHeader.jsx'
import AppFooter from '../components/common/AppFooter.jsx'
import MobileSidebar from '../components/common/MobileSidebar.jsx'
import './AppLayout.css'

function AppLayout() {
  // Sidebar collapse state — saved in localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('fieldservice-sidebar-collapsed')
    return saved === 'true'
  })

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Save collapse preference
  useEffect(() => {
    localStorage.setItem('fieldservice-sidebar-collapsed', sidebarCollapsed)
  }, [sidebarCollapsed])

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'app-layout--collapsed' : ''}`}>
      {/* Desktop Sidebar — hidden on mobile via CSS */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Sidebar Drawer */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main area (header + content + footer) */}
      <div className="app-layout__main">
        <AppHeader
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
        />

        <main className="app-layout__content">
          <Outlet />
        </main>

        <AppFooter />
      </div>
    </div>
  )
}

export default AppLayout
