import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// ====================================
// PasswordInput — Input with show/hide toggle
// ====================================

function PasswordInput({
  label,
  id,
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  disabled = false
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      <div className="form-input-wrap form-input-wrap--has-toggle">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-input ${error ? 'form-input--error' : ''}`}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className="form-toggle-password"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default PasswordInput
