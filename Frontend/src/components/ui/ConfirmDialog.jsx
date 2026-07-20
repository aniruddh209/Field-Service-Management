// ====================================
// ConfirmDialog — Delete/Destructive Action Confirmation
// ====================================
//
// Usage:
//   <ConfirmDialog
//     isOpen={showConfirm}
//     title="Delete Address"
//     message="Are you sure you want to delete this address? This action cannot be undone."
//     confirmLabel="Delete"
//     variant="danger"
//     onConfirm={handleDelete}
//     onCancel={() => setShowConfirm(false)}
//   />
//
// ====================================

import { AlertTriangle } from 'lucide-react'
import Modal from './Modal.jsx'

function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger' // 'danger' | 'warning' | 'primary'
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="confirm-dialog">
        <div className={`confirm-dialog__icon confirm-dialog__icon--${variant}`}>
          <AlertTriangle size={24} />
        </div>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button className="btn btn--outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={`btn btn--${variant}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
