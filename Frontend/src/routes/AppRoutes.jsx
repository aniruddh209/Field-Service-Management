import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getDashboardPath } from '../constants/navigation.js'

// Layouts
import AppLayout from '../layouts/AppLayout.jsx'

// Auth Pages (public)
import LoginPage from '../pages/auth/LoginPage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx'

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard.jsx'
import ServicesPage from '../pages/customer/ServicesPage.jsx'
import MyRequestsPage from '../pages/customer/MyRequestsPage.jsx'
import NewRequestPage from '../pages/customer/NewRequestPage.jsx'
import RequestDetailsPage from '../pages/customer/RequestDetailsPage.jsx'
import AddressesPage from '../pages/customer/AddressesPage.jsx'
import AssetsPage from '../pages/customer/AssetsPage.jsx'
import InvoicesPage from '../pages/customer/InvoicesPage.jsx'

// Management Pages
import DashboardPage from '../pages/DashboardPage.jsx' // main dashboard used for mgmt
import ManagementRequestsPage from '../pages/management/ManagementRequestsPage.jsx'
import ManagementRequestDetailsPage from '../pages/management/ManagementRequestDetailsPage.jsx'
import ManagementTechniciansPage from '../pages/management/ManagementTechniciansPage.jsx'
import TechnicianDetailsPage from '../pages/management/TechnicianDetailsPage.jsx'
import ManagementServicesPage from '../pages/management/ManagementServicesPage.jsx'
import ManagementSchedulePage from '../pages/management/ManagementSchedulePage.jsx'
import ManagementInventoryPage from '../pages/management/ManagementInventoryPage.jsx'
import ManagementInvoicesPage from '../pages/management/ManagementInvoicesPage.jsx'
import CompletedWorkPage from '../pages/management/CompletedWorkPage.jsx'
import ReviewWorkReportPage from '../pages/management/ReviewWorkReportPage.jsx'
import GenerateInvoicePage from '../pages/management/GenerateInvoicePage.jsx'

// Technician Pages
import TechnicianDashboard from '../pages/technician/TechnicianDashboard.jsx'
import AssignedJobsPage from '../pages/technician/AssignedJobsPage.jsx'
import JobDetailsPage from '../pages/technician/JobDetailsPage.jsx'
import TechnicianSchedulePage from '../pages/technician/TechnicianSchedulePage.jsx'
import JobHistoryPage from '../pages/technician/JobHistoryPage.jsx'

// Shared Pages
import ProfilePage from '../pages/shared/ProfilePage.jsx'
import SettingsPage from '../pages/shared/SettingsPage.jsx'
import HelpSupportPage from '../pages/shared/HelpSupportPage.jsx'
import InvoiceDetailsPage from '../pages/shared/InvoiceDetailsPage.jsx'

// Error Pages
import NotFound from '../pages/errors/NotFound.jsx'
import UnauthorizedPage from '../pages/errors/UnauthorizedPage.jsx'

// Protected Route wrapper
import ProtectedRoute from './ProtectedRoute.jsx'

function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>

      {/* ---- PUBLIC ROUTES ---- */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={getDashboardPath(user.role)} replace />
            : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to={getDashboardPath(user.role)} replace />
            : <RegisterPage />
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated
            ? <Navigate to={getDashboardPath(user.role)} replace />
            : <ForgotPasswordPage />
        }
      />

      {/* ---- CUSTOMER ROUTES ---- */}
      <Route element={<ProtectedRoute allowedRoles={['Customer']} />}>
        <Route element={<AppLayout />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/services" element={<ServicesPage />} />
          <Route path="/customer/requests" element={<MyRequestsPage />} />
          <Route path="/customer/requests/new" element={<NewRequestPage />} />
          <Route path="/customer/requests/:id" element={<RequestDetailsPage />} />
          <Route path="/customer/addresses" element={<AddressesPage />} />
          <Route path="/customer/assets" element={<AssetsPage />} />
          <Route path="/customer/invoices" element={<InvoicesPage />} />
          <Route path="/customer/invoices/:id" element={<InvoiceDetailsPage />} />
        </Route>
      </Route>

      {/* ---- MANAGEMENT ROUTES (Owner + Manager) ---- */}
      <Route element={<ProtectedRoute allowedRoles={['Owner', 'Manager']} />}>
        <Route element={<AppLayout />}>
          <Route path="/management/dashboard" element={<DashboardPage />} />
          <Route path="/management/requests" element={<ManagementRequestsPage />} />
          <Route path="/management/requests/:id" element={<ManagementRequestDetailsPage />} />
          <Route path="/management/requests/:id/report" element={<ReviewWorkReportPage />} />
          <Route path="/management/technicians" element={<ManagementTechniciansPage />} />
          <Route path="/management/technicians/:id" element={<TechnicianDetailsPage />} />
          <Route path="/management/services" element={<ManagementServicesPage />} />
          <Route path="/management/schedule" element={<ManagementSchedulePage />} />
          <Route path="/management/inventory" element={<ManagementInventoryPage />} />
          <Route path="/management/invoices" element={<ManagementInvoicesPage />} />
          <Route path="/management/invoices/create" element={<GenerateInvoicePage />} />
          <Route path="/management/invoices/:id" element={<InvoiceDetailsPage />} />
          <Route path="/management/completed-work" element={<CompletedWorkPage />} />
        </Route>
      </Route>

      {/* ---- TECHNICIAN ROUTES ---- */}
      <Route element={<ProtectedRoute allowedRoles={['Technician']} />}>
        <Route element={<AppLayout />}>
          <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
          <Route path="/technician/jobs" element={<AssignedJobsPage />} />
          <Route path="/technician/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/technician/schedule" element={<TechnicianSchedulePage />} />
          <Route path="/technician/history" element={<JobHistoryPage />} />
        </Route>
      </Route>

      {/* ---- SHARED ROUTES (any authenticated user) ---- */}
      <Route element={<ProtectedRoute allowedRoles={['Customer', 'Owner', 'Manager', 'Technician']} />}>
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpSupportPage />} />
        </Route>
      </Route>

      {/* ---- ERROR ROUTES ---- */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ---- ROOT REDIRECT ---- */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to={getDashboardPath(user.role)} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* ---- 404 ---- */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  )
}

export default AppRoutes
