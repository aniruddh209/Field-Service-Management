import React, { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export const specializations = [
  'Air Conditioning',
  'Electrical Services',
  'Plumbing Services',
  'Appliance Repair',
  'Security Systems',
  'CCTV Installation',
  'General Maintenance'
]

function TechnicianForm({ mode = 'create', initialValues = null, onSubmit, onCancel, nextEmployeeCode = '' }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    employeeCode: '',
    specialization: '',
    status: 'Available',
    joiningDate: new Date().toISOString().split('T')[0],
    password: '',
    confirmPassword: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate initial values on edit mode
  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      setFormData({
        fullName: initialValues.fullName || '',
        email: initialValues.email || '',
        phone: initialValues.phone || '',
        employeeCode: initialValues.employeeCode || '',
        specialization: initialValues.specialization || '',
        status: initialValues.status || 'Available',
        joiningDate: initialValues.joiningDate ? initialValues.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0],
        password: '',
        confirmPassword: '',
        notes: initialValues.notes || ''
      })
    } else if (mode === 'create' && nextEmployeeCode) {
      setFormData(prev => ({ ...prev, employeeCode: nextEmployeeCode }))
    }
  }, [mode, initialValues, nextEmployeeCode])

  const validate = () => {
    const newErrors = {}

    // Full Name
    const fullNameTrim = formData.fullName.trim()
    if (!fullNameTrim) {
      newErrors.fullName = 'Full name is required'
    } else if (fullNameTrim.length < 3) {
      newErrors.fullName = 'Full name must contain at least 3 characters'
    } else if (fullNameTrim.length > 100) {
      newErrors.fullName = 'Full name cannot exceed 100 characters'
    }

    // Email
    const emailTrim = formData.email.trim()
    if (!emailTrim) {
      newErrors.email = 'Email address is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailTrim)) {
        newErrors.email = 'Enter a valid email address'
      }
    }

    // Phone (10 digits Indian mobile)
    const phoneTrim = formData.phone.trim()
    if (!phoneTrim) {
      newErrors.phone = 'Phone number is required'
    } else {
      const cleanPhone = phoneTrim.replace(/\D/g, '')
      if (cleanPhone.length !== 10) {
        newErrors.phone = 'Phone number must contain exactly 10 digits'
      } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        newErrors.phone = 'Enter a valid 10-digit mobile number'
      }
    }

    // Employee Code
    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = 'Employee code is required'
    }

    // Specialization
    if (!formData.specialization) {
      newErrors.specialization = 'Please select a specialization'
    }

    // Password validation (only in create mode)
    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'Temporary password is required'
      } else {
        if (formData.password.length < 8) {
          newErrors.password = 'Password must contain at least 8 characters'
        }
        if (!/[A-Z]/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one uppercase letter'
        }
        if (!/[a-z]/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one lowercase letter'
        }
        if (!/\d/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one number'
        }
      }

      // Confirm Password
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm the temporary password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    // Short Notes
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Short notes cannot exceed 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for field on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      // Prepare payload matching ASP.NET Technician model
      const submissionData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim().replace(/\D/g, ''),
        employeeCode: formData.employeeCode.trim(),
        specialization: formData.specialization,
        status: formData.status,
        joiningDate: formData.joiningDate,
        notes: formData.notes.trim()
      }

      if (mode === 'create') {
        submissionData.temporaryPassword = formData.password
      }

      if (mode === 'edit' && initialValues) {
        submissionData.id = initialValues.id
      }

      await onSubmit(submissionData)
    } catch (err) {
      console.error(err)
      setErrors(prev => ({ ...prev, submit: 'Unable to save technician. Please try again.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="technician-form" noValidate>
      {errors.submit && (
        <div className="form-error" style={{ marginBottom: 12, padding: 8, background: 'var(--color-danger-light)', borderRadius: 'var(--radius-sm)' }}>
          {errors.submit}
        </div>
      )}

      {/* Section A: Personal Information */}
      <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
        A. Personal Information
      </h4>
      
      <div className="form-group">
        <label className="form-label form-label--required" htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          className={`form-input ${errors.fullName ? 'form-input--error' : ''}`}
          placeholder="e.g. Ravi Kumar"
          value={formData.fullName}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {errors.fullName && <span className="form-error">{errors.fullName}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label form-label--required" htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            className={`form-input ${errors.email ? 'form-input--error' : ''}`}
            placeholder="e.g. ravi.kumar@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label form-label--required" htmlFor="phone">Phone Number (Indian Mobile)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
            placeholder="e.g. 9876500001"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '16px 0' }} />

      {/* Section B: Work Information */}
      <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
        B. Work Information
      </h4>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label form-label--required" htmlFor="employeeCode">Employee Code</label>
          <input
            id="employeeCode"
            name="employeeCode"
            type="text"
            className={`form-input ${errors.employeeCode ? 'form-input--error' : ''}`}
            placeholder="e.g. TECH-007"
            value={formData.employeeCode}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.employeeCode && <span className="form-error">{errors.employeeCode}</span>}
        </div>

        <div className="form-group">
          <label className="form-label form-label--required" htmlFor="specialization">Specialization</label>
          <select
            id="specialization"
            name="specialization"
            className={`form-select ${errors.specialization ? 'form-select--error' : ''}`}
            value={formData.specialization}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">Select Specialization</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          {errors.specialization && <span className="form-error">{errors.specialization}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="status">Work Status</label>
          <select
            id="status"
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="joiningDate">Joining Date</label>
          <input
            id="joiningDate"
            name="joiningDate"
            type="date"
            className="form-input"
            value={formData.joiningDate}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {mode === 'create' && (
        <>
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '16px 0' }} />

          {/* Section C: Account Access */}
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
            C. Account Access
          </h4>

          <div className="form-row">
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label form-label--required" htmlFor="password">Temporary Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password ? <span className="form-error">{errors.password}</span> : (
                <span className="form-hint">At least one uppercase, lowercase, and number.</span>
              )}
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label form-label--required" htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`}
                  placeholder="Repeat temporary password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>
          </div>
        </>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '16px 0' }} />

      {/* Section D: Optional Information */}
      <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
        {mode === 'create' ? 'C' : 'C'}. Optional Information
      </h4>

      <div className="form-group">
        <label className="form-label" htmlFor="notes">Short Notes</label>
        <textarea
          id="notes"
          name="notes"
          className={`form-textarea ${errors.notes ? 'form-textarea--error' : ''}`}
          placeholder="Enter experience history, skill notes, or internal details (max 500 characters)..."
          value={formData.notes}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {errors.notes && <span className="form-error">{errors.notes}</span>}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn--outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (mode === 'create' ? 'Adding Technician...' : 'Saving Changes...') : (mode === 'create' ? 'Add Technician' : 'Save Changes')}
        </button>
      </div>
    </form>
  )
}

export default TechnicianForm
