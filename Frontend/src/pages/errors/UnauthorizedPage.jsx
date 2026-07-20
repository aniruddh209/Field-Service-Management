import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getDashboardPath } from '../../constants/navigation.js'

function UnauthorizedPage() {
  const { user } = useAuth()

  // Redirect to the user's own dashboard if logged in, otherwise to login
  const returnPath = user ? getDashboardPath(user.role) : '/login'

  return (
    <div className="not-found">
      <div className="not-found__content">
        <ShieldX size={48} className="not-found__icon" style={{ color: 'var(--color-danger)' }} />
        <h1 className="not-found__code">403</h1>
        <h2 className="not-found__title">Access Restricted</h2>
        <p className="not-found__message">
          You do not have permission to view this page.
          Please contact your administrator if you believe this is an error.
        </p>
        <Link to={returnPath} className="not-found__btn">
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default UnauthorizedPage
