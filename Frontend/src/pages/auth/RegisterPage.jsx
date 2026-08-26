import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wrench, ArrowLeft, Users, Shield, Briefcase, UserCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import FormInput from '../../components/forms/FormInput.jsx'
import PasswordInput from '../../components/forms/PasswordInput.jsx'
import './RegisterPage.css'

const ROLE_OPTIONS = [
  { value: 'Customer', label: 'Customer', desc: 'Book & track service requests', icon: Users },
  { value: 'Technician', label: 'Technician', desc: 'Accept & perform field jobs', icon: Wrench },
  { value: 'Manager', label: 'Manager', desc: 'Manage requests & dispatch team', icon: Briefcase },
  { value: 'Owner', label: 'Owner', desc: 'Full business operations access', icon: Shield }
]

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  // Form state matching RegisterUserDto
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Customer',
    password: '',
    confirmPassword: ''
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  // Update a single form field
  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Validate all fields matching RegisterUserDto rules
  function validate() {
    const newErrors = {}

    if (!form.firstName.trim() || form.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters'
    }

    if (!form.lastName.trim() || form.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!form.email.includes('@')) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!form.role) {
      newErrors.role = 'Please select your role'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms'
    }

    return newErrors
  }

  // Handle form submit — calls POST /api/Auth/register matching RegisterUserDto
  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    const formErrors = validate()
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) return

    setIsLoading(true)

    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phone.trim(),
        role: form.role,
        password: form.password
      })
      navigate('/login')
    } catch (err) {
      setApiError(err.message || 'Registration failed. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-page__container">
        {/* Back link */}
        <Link to="/login" className="register-page__back">
          <ArrowLeft size={16} />
          Back to login
        </Link>

        {/* Logo */}
        <div className="register-page__logo">
          <div className="login-page__logo-icon">
            <Wrench size={22} />
          </div>
          <span className="login-page__logo-name">Field Service</span>
        </div>

        <h2 className="register-page__title">Create your account</h2>
        <p className="register-page__subtitle">
          Select your role and register to access Field Service Platform
        </p>

        {apiError && (
          <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px 14px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fca5a5' }}>
            {apiError}
          </div>
        )}

        {/* Registration Form */}
        <form className="register-page__form" onSubmit={handleSubmit} noValidate>
          
          {/* Role Selector Grid */}
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label form-label--required" style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Account Role / Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {ROLE_OPTIONS.map(opt => {
                const Icon = opt.icon
                const isSelected = form.role === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField('role', opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: isSelected ? '#fff' : 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.role && <p className="form-error" style={{ marginTop: 4 }}>{errors.role}</p>}
          </div>

          {/* Name row */}
          <div className="register-page__row">
            <FormInput
              label="First Name"
              id="register-first-name"
              value={form.firstName}
              onChange={e => updateField('firstName', e.target.value)}
              placeholder="Arjun"
              error={errors.firstName}
              required
            />
            <FormInput
              label="Last Name"
              id="register-last-name"
              value={form.lastName}
              onChange={e => updateField('lastName', e.target.value)}
              placeholder="Mehta"
              error={errors.lastName}
              required
            />
          </div>

          <FormInput
            label="Email Address"
            id="register-email"
            type="email"
            value={form.email}
            onChange={e => updateField('email', e.target.value)}
            placeholder="you@example.com"
            error={errors.email}
            required
          />

          <FormInput
            label="Phone Number"
            id="register-phone"
            type="tel"
            value={form.phone}
            onChange={e => updateField('phone', e.target.value)}
            placeholder="+91 98765 43210"
            error={errors.phone}
            required
          />

          <PasswordInput
            label="Password"
            id="register-password"
            value={form.password}
            onChange={e => updateField('password', e.target.value)}
            placeholder="At least 8 characters"
            error={errors.password}
            required
          />

          <PasswordInput
            label="Confirm Password"
            id="register-confirm-password"
            value={form.confirmPassword}
            onChange={e => updateField('confirmPassword', e.target.value)}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            required
          />

          {/* Terms */}
          <div className="register-page__terms">
            <label className="login-page__checkbox-label" htmlFor="accept-terms">
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                className="login-page__checkbox"
              />
              <span>
                I agree to the{' '}
                <a href="#terms">Terms of Service</a> and{' '}
                <a href="#privacy">Privacy Policy</a>
              </span>
            </label>
            {errors.terms && (
              <p className="form-error">{errors.terms}</p>
            )}
          </div>

          <button
            type="submit"
            className="login-page__submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : `Create ${form.role} Account`}
          </button>
        </form>

        <p className="register-page__login-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
