import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Wrench,
  ArrowRight,
  ClipboardList,
  UserCheck,
  Truck,
  CheckCircle,
  Briefcase,
  Users,
  Shield
} from 'lucide-react'
import { useAuth, demoUsers } from '../../context/AuthContext.jsx'
import { getDashboardPath } from '../../constants/navigation.js'
import FormInput from '../../components/forms/FormInput.jsx'
import PasswordInput from '../../components/forms/PasswordInput.jsx'
import './LoginPage.css'

// The workflow steps shown on the left panel
const workflowSteps = [
  { label: 'Request', icon: ClipboardList },
  { label: 'Assign', icon: UserCheck },
  { label: 'Dispatch', icon: Truck },
  { label: 'Complete', icon: CheckCircle }
]

// Stats shown on the left panel (demo visuals only)
const demoStats = [
  { label: 'Active Jobs', value: '24' },
  { label: 'Technicians Online', value: '8' },
  { label: 'Completion Rate', value: '96%' }
]

// Demo role cards for quick login
const roleCards = [
  {
    role: 'Customer',
    icon: Users,
    desc: 'Create and track service requests'
  },
  {
    role: 'Owner',
    icon: Shield,
    desc: 'Full business operations access'
  },
  {
    role: 'Manager',
    icon: Briefcase,
    desc: 'Manage requests and technicians'
  },
  {
    role: 'Technician',
    icon: Wrench,
    desc: 'Accept and complete assigned jobs'
  }
]

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Validate form fields
  function validate() {
    const newErrors = {}
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!email.includes('@')) {
      newErrors.email = 'Enter a valid email address'
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required'
    }
    return newErrors
  }

  // Handle form submit
  // Future: This will call POST /api/auth/login
  function handleSubmit(e) {
    e.preventDefault()
    const formErrors = validate()
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) return

    setIsLoading(true)

    // Simulate brief loading (demo only)
    setTimeout(() => {
      // Demo: log in as Owner for email/password login
      const demoUser = demoUsers.Owner
      login(demoUser)
      navigate(getDashboardPath(demoUser.role), { replace: true })
      setIsLoading(false)
    }, 600)
  }

  // Handle demo role quick login
  function handleDemoLogin(role) {
    const demoUser = demoUsers[role]
    login(demoUser)
    navigate(getDashboardPath(role), { replace: true })
  }

  return (
    <div className="login-page">
      {/* ---- LEFT VISUAL PANEL ---- */}
      <div className="login-page__visual">
        <div className="login-page__visual-content">
          {/* Logo */}
          <div className="login-page__logo">
            <div className="login-page__logo-icon">
              <Wrench size={24} />
            </div>
            <div>
              <h2 className="login-page__logo-name">Field Service</h2>
              <p className="login-page__logo-tagline">Service Operations Platform</p>
            </div>
          </div>

          {/* Headline */}
          <div className="login-page__headline">
            <h1>Run every service operation from one place.</h1>
            <p>
              Manage requests, coordinate technicians, track field work,
              and keep customers informed through one connected workflow.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="login-page__workflow">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.label} className="login-page__workflow-step">
                  <div className="login-page__workflow-icon">
                    <Icon size={18} />
                  </div>
                  <span>{step.label}</span>
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight size={14} className="login-page__workflow-arrow" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Demo Stats */}
          <div className="login-page__stats">
            {demoStats.map(stat => (
              <div key={stat.label} className="login-page__stat">
                <span className="login-page__stat-value">{stat.value}</span>
                <span className="login-page__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subtle CSS grid pattern overlay */}
        <div className="login-page__visual-pattern" />
      </div>

      {/* ---- RIGHT FORM PANEL ---- */}
      <div className="login-page__form-panel">
        <div className="login-page__form-container">
          {/* Mobile-only logo */}
          <div className="login-page__mobile-logo">
            <div className="login-page__logo-icon">
              <Wrench size={22} />
            </div>
            <span className="login-page__logo-name">Field Service</span>
          </div>

          <h2 className="login-page__form-title">Welcome back</h2>
          <p className="login-page__form-subtitle">
            Sign in to continue to Field Service
          </p>

          {/* Login Form */}
          <form className="login-page__form" onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Email"
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              required
            />

            <PasswordInput
              label="Password"
              id="login-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              error={errors.password}
              required
            />

            <div className="login-page__options">
              <label className="login-page__checkbox-label" htmlFor="remember-me">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="login-page__checkbox"
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="login-page__forgot-link">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="login-page__submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="login-page__register-link">
            Don't have an account?{' '}
            <Link to="/register">Create customer account</Link>
          </p>

          {/* ---- DEMO ACCESS SECTION ---- */}
          <div className="login-page__demo-section">
            <div className="login-page__demo-header">
              <span className="login-page__demo-badge">DEV</span>
              <span>Development Demo Access</span>
            </div>
            <div className="login-page__demo-grid">
              {roleCards.map(card => {
                const Icon = card.icon
                return (
                  <button
                    key={card.role}
                    className="login-page__demo-card"
                    onClick={() => handleDemoLogin(card.role)}
                  >
                    <Icon size={18} className="login-page__demo-card-icon" />
                    <div>
                      <span className="login-page__demo-card-role">{card.role}</span>
                      <span className="login-page__demo-card-desc">{card.desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
