// ====================================
// Modal — Reusable Dialog Component
// ====================================
//
// Used for: Add/Edit Address, Add/Edit Asset, Assign Technician,
// Add/Edit Service, Add/Edit Inventory, Reject Job, etc.
//
// Usage:
//   <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Address">
//     <form>...</form>
//   </Modal>
//
// ====================================

import { useEffect } from 'react'
import { X } from 'lucide-react'

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Close on Escape key
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClass = size === 'lg' ? 'modal__content--lg' : size === 'sm' ? 'modal__content--sm' : ''

  return (
    <div className="modal__overlay" onClick={onClose}>
      <div
        className={`modal__content ${sizeClass}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
