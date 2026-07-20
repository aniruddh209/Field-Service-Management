// ====================================
// FormInput — Reusable input field
// ====================================
//
// Props:
//   label       — Field label text
//   id          — Unique input id (required for accessibility)
//   type        — Input type (text, email, tel, etc.)
//   value       — Current value
//   onChange     — Change handler
//   placeholder — Placeholder text
//   error       — Error message string (shows below input)
//   required    — Whether field is required
//   icon        — Optional Lucide icon component to show on left
//   disabled    — Disable the input
// ====================================

function FormInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  icon: Icon = null,
  disabled = false
}) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      <div className={`form-input-wrap ${Icon ? 'form-input-wrap--has-icon' : ''}`}>
        {Icon && <Icon size={18} className="form-input-icon" />}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-input ${error ? 'form-input--error' : ''}`}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormInput
