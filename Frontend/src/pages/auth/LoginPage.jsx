import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Wrench,
  ArrowRight,
  ClipboardList,
  UserCheck,
  Truck,
  CheckCircle,
  Users,
  Shield,
  Briefcase
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
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

// Stats shown on the left panel
const platformStats = [
  { label: 'Active Jobs', value: '24' },
  { label: 'Technicians Online', value: '8' },
  { label: 'Completion Rate', value: '96%' }
]

// Role tabs available for sign in context
const ROLE_TABS = [
  { role: 'Customer', label: 'Customer', icon: Users, hint: 'Book & track service requests' },
  { role: 'Technician', label: 'Technician', icon: Wrench, hint: 'Perform assigned field jobs' },
  { role: 'Manager', label: 'Manager', icon: Briefcase, hint: 'Manage requests & team' },
  { role: 'Owner', label: 'Owner', icon: Shield, hint: 'Full business control' }
]

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Selected role context tab
  const [selectedRole, setSelectedRole] = useState('Customer')

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

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

  // Handle form submit — calls POST /api/Auth/login
  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    const formErrors = validate()
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) return

    setIsLoading(true)

    try {
      const loggedUser = await login(email, password, selectedRole)
      const roleToUse = loggedUser?.role || selectedRole
      const targetPath = getDashboardPath(roleToUse)
      navigate(targetPath, { replace: true })
    } catch (err) {
      setApiError(err.message || 'Login failed. Please verify email and password.')
    } finally {
      setIsLoading(false)
    }
  }

  const activeTabObj = ROLE_TABS.find(t => t.role === selectedRole)

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

          {/* Platform Stats */}
          <div className="login-page__stats">
            {platformStats.map(stat => (
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

          <h2 className="login-page__form-title">Sign In to Field Service</h2>
          <p className="login-page__form-subtitle">
            Select portal role and enter your credentials to log in
          </p>

          {/* Role Portal Selector Tabs */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
              Select Portal / Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, backgroundColor: 'var(--color-surface-hover)', padding: 4, borderRadius: 8, border: '1px solid var(--color-border)' }}>
              {ROLE_TABS.map(tab => {
                const Icon = tab.icon
                const isActive = selectedRole === tab.role
                return (
                  <button
                    key={tab.role}
                    type="button"
                    onClick={() => setSelectedRole(tab.role)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: '8px 4px',
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: isActive ? 'var(--color-surface)' : 'transparent',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
            {activeTabObj && (
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginTop: 6, textAlign: 'center' }}>
                {activeTabObj.hint}
              </p>
            )}
          </div>

          {apiError && (
            <div className="login-page__api-error" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px 14px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fca5a5' }}>
              {apiError}
            </div>
          )}

          {/* Login Form */}
          <form className="login-page__form" onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Email Address"
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={`Enter your ${selectedRole.toLowerCase()} email`}
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
              {isLoading ? 'Signing in...' : `Sign In as ${selectedRole}`}
            </button>
          </form>

          <p className="login-page__register-link">
            Don't have an account?{' '}
            <Link to="/register">Create new account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
