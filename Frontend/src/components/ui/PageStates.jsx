// ====================================
// Page State Components
// ====================================
//
// Reusable loading, error, and empty state components
// for consistent UX across all data pages.
//
// ====================================

import { AlertCircle, Inbox, Loader } from 'lucide-react'

/**
 * Loading spinner with optional message.
 */
export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="page-state page-state--loading">
      <div className="page-state__spinner"></div>
      <p className="page-state__message">{message}</p>
    </div>
  )
}

/**
 * Error state with retry button.
 */
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="page-state page-state--error">
      <AlertCircle size={40} className="page-state__icon page-state__icon--error" />
      <h3 className="page-state__title">Unable to load data</h3>
      <p className="page-state__message">{message}</p>
      {onRetry && (
        <button className="btn btn--primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  )
}

/**
 * Empty state with optional action button.
 */
export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, actionLabel, onAction }) {
  return (
    <div className="page-state page-state--empty">
      <Icon size={40} className="page-state__icon page-state__icon--empty" />
      <h3 className="page-state__title">{title}</h3>
      {message && <p className="page-state__message">{message}</p>}
      {actionLabel && onAction && (
        <button className="btn btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
