import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// ====================================
// ProtectedRoute — Guards app pages
// ====================================
//
// How it works:
//
// 1. If user is NOT logged in → redirect to /login
// 2. If user IS logged in but their role is NOT in the
//    allowed roles list → redirect to /unauthorized
// 3. If user IS logged in AND role is allowed → render the page
//
// Usage in routes:
//   <Route element={<ProtectedRoute allowedRoles={['Owner', 'Manager']} />}>
//     <Route path="/management/dashboard" element={<SomePage />} />
//   </Route>
//
// ====================================

function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuth()

  // Not logged in — go to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in but role is not allowed — go to unauthorized page
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Allowed — render child routes
  return <Outlet />
}

export default ProtectedRoute
