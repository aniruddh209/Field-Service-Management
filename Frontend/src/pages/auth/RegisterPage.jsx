import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wrench, ArrowLeft } from 'lucide-react'
import FormInput from '../../components/forms/FormInput.jsx'
import PasswordInput from '../../components/forms/PasswordInput.jsx'
import './RegisterPage.css'

// ====================================
// RegisterPage — Customer Registration Only
// ====================================
//
// Public registration is for CUSTOMER role only.
// Owner, Manager, Technician accounts are created
// by authorized management through the admin panel.
//
// Future: This form will POST to /api/auth/register
// ====================================

function RegisterPage() {
  const navigate = useNavigate()

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Update a single form field
  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Validate all fields
  function validate() {
    const newErrors = {}

    if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required'

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!form.email.includes('@')) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
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

  // Handle form submit
  // Future: POST /api/auth/register
  function handleSubmit(e) {
    e.preventDefault()
    const formErrors = validate()
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) return

    setIsLoading(true)

    // Simulate API call (demo only)
    setTimeout(() => {
      setIsLoading(false)
      // After registration, redirect to login
      navigate('/login')
    }, 800)
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
          Register as a customer to start requesting services
        </p>

        {/* Registration Form */}
        <form className="register-page__form" onSubmit={handleSubmit} noValidate>
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
            label="Email"
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
            placeholder="At least 6 characters"
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Staff note */}
        <p className="register-page__staff-note">
          Business staff accounts (Owner, Manager, Technician) are created by authorized management.
        </p>

        <p className="register-page__login-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
