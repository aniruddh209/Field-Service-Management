import { Link } from 'react-router-dom'
import { Home, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getDashboardPath } from '../../constants/navigation.js'
import './NotFound.css'

function NotFound() {
  const { user } = useAuth()

  // If logged in, go to role-appropriate dashboard; otherwise go to login
  const returnPath = user ? getDashboardPath(user.role) : '/login'

  return (
    <div className="not-found">
      <div className="not-found__content">
        <AlertTriangle size={48} className="not-found__icon" />
        <h1 className="not-found__code">404</h1>
        <h2 className="not-found__title">Page Not Found</h2>
        <p className="not-found__message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={returnPath} className="not-found__btn">
          <Home size={18} />
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
