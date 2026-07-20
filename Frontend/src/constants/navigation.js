import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Users,
  CalendarDays,
  Package,
  Receipt,
  MapPin,
  Box,
  Briefcase,
  History,
  Settings,
  CircleHelp
} from 'lucide-react'

// ====================================
// Role-Based Navigation Configuration
// ====================================
//
// This single file controls what sidebar items
// each role sees. Both AppSidebar and MobileSidebar
// read from here so navigation stays in sync.
//
// When you add a new page, just add it here.
// ====================================

// Customer sees their own requests, services, and account info
const customerNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/customer/dashboard' },
  { label: 'Services', icon: Wrench, path: '/customer/services' },
  { label: 'My Requests', icon: ClipboardList, path: '/customer/requests' },
  { label: 'Addresses', icon: MapPin, path: '/customer/addresses' },
  { label: 'Assets', icon: Box, path: '/customer/assets' },
  { label: 'Invoices', icon: Receipt, path: '/customer/invoices' }
]

// Owner and Manager both see the management dashboard
const managementNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/management/dashboard' },
  { label: 'Service Requests', icon: ClipboardList, path: '/management/requests' },
  { label: 'Completed Work', icon: History, path: '/management/completed-work' },
  { label: 'Technicians', icon: Users, path: '/management/technicians' },
  { label: 'Services', icon: Wrench, path: '/management/services' },
  { label: 'Schedule', icon: CalendarDays, path: '/management/schedule' },
  { label: 'Inventory', icon: Package, path: '/management/inventory' },
  { label: 'Invoices', icon: Receipt, path: '/management/invoices' }
]

// Technician sees their assigned jobs and schedule
const technicianNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/technician/dashboard' },
  { label: 'Assigned Jobs', icon: Briefcase, path: '/technician/jobs' },
  { label: 'Schedule', icon: CalendarDays, path: '/technician/schedule' },
  { label: 'Job History', icon: History, path: '/technician/history' }
]

// Map each role to its navigation items
export const navigationByRole = {
  Customer: customerNav,
  Owner: managementNav,
  Manager: managementNav,
  Technician: technicianNav
}

// Bottom nav items — same for all roles
export const bottomNavItems = [
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Help & Support', icon: CircleHelp, path: '/help' }
]

// After login, where should each role go?
export function getDashboardPath(role) {
  const paths = {
    Customer: '/customer/dashboard',
    Owner: '/management/dashboard',
    Manager: '/management/dashboard',
    Technician: '/technician/dashboard'
  }
  return paths[role] || '/login'
}
