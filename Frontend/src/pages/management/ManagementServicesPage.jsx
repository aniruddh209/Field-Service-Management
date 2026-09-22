import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import { getServices, createService, updateService, deleteService, toggleServiceActive } from '../../services/serviceCatalogService.js'
import { formatCurrency } from '../../utils/format.js'
import Modal from '../../components/ui/Modal.jsx'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

const EMPTY_FORM = {
  serviceName: '',
  category: 'Cooling',
  description: '',
  basePrice: '',
  estimatedHours: 1,
  image: '',
  isActive: true
}

function ManagementServicesPage() {
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [modalApiError, setModalApiError] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  
  // Delete Modal State
  const [deletingService, setDeletingService] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  async function load(showSpinner = true) {
    try {
      if (showSpinner) setIsLoading(true)
      const data = await getServices()
      setServices(data || [])
    } catch (error) {
      console.error("Failed to fetch services:", error)
    } finally {
      if (showSpinner) setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = services.filter(s =>
    (s.serviceName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.category || "").toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalApiError('')
    setShowModal(true)
  }

  function openEdit(svc) {
    setEditingId(svc.id)
    setForm({
      serviceName: svc.serviceName || '',
      category: svc.category || 'Cooling',
      description: svc.description || '',
      basePrice: svc.basePrice || '',
      estimatedHours: svc.estimatedHours || 1,
      image: svc.image || '',
      isActive: svc.isActive ?? true
    })
    setErrors({})
    setModalApiError('')
    setShowModal(true)
  }

  function openDeleteConfirm(svc) {
    setDeletingService(svc)
    setShowDeleteModal(true)
  }

  async function handleToggle(svc) {
    try {
      await toggleServiceActive(svc.id)
      showToast(`Service "${svc.serviceName}" status updated.`)
      await load(false)
    } catch (err) {
      console.error(err)
      showToast('Failed to update service status.')
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingService) return
    try {
      setIsSubmitting(true)
      await deleteService(deletingService.id)
      showToast(`Service "${deletingService.serviceName}" deleted successfully.`)
      setShowDeleteModal(false)
      setDeletingService(null)
      await load(false)
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || err.message || 'Failed to delete service.'
      showToast(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  function validate() {
    const e = {}

    if (!form.serviceName.trim())
      e.serviceName = "Service Name is required"

    if (!form.category.trim())
      e.category = "Category is required"

    if (!form.description.trim())
      e.description = "Description is required"

    if (form.basePrice === '' || form.basePrice === null || isNaN(form.basePrice) || Number(form.basePrice) <= 0)
      e.basePrice = "Enter valid price (> 0)"

    if (!form.estimatedHours || isNaN(form.estimatedHours) || Number(form.estimatedHours) <= 0)
      e.estimatedHours = "Enter valid hours (> 0)"

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setModalApiError('')
    if (!validate()) return

    setIsSubmitting(true)
    const data = {
      ...form,
      serviceName: form.serviceName.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      basePrice: Number(form.basePrice),
      estimatedHours: Number(form.estimatedHours)
    }

    try {
      if (editingId) {
        await updateService(editingId, {
          id: editingId,
          ...data
        })
        showToast('Service updated successfully!')
      } else {
        await createService(data)
        showToast('Service created successfully!')
      }
      setShowModal(false)
      setForm(EMPTY_FORM)
      await load(false)
    } catch (err) {
      console.error(err)
      const errMsg = err.response?.data?.message || err.message || 'Failed to save service. Please check details.'
      setModalApiError(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <PageContainer><LoadingState message="Loading services..." /></PageContainer>

  return (
    <PageContainer>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          background: 'var(--color-primary)', color: 'white',
          padding: '12px 24px', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--dropdown-shadow)', fontSize: '0.88rem',
          fontWeight: 600, animation: 'fadeIn 0.2s ease'
        }}>
          {toastMessage}
        </div>
      )}

      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">Service Catalog</h1>
          <p className="page-header__subtitle">Manage services offered to customers</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={openAdd}>
            <Plus size={16} /> Add Service
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-bar__search">
          <Search size={16} className="filters-bar__search-icon" />
          <input
            className="filters-bar__search-input"
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No services found" message="Try adjusting your filters or add a new service." />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Estimated Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(svc => (
                <tr key={svc.id}>
                  <td style={{ fontWeight: 600 }}>{svc.serviceName}</td>
                  <td>{svc.category}</td>
                  <td>{svc.estimatedHours} hr{svc.estimatedHours !== 1 ? 's' : ''}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {formatCurrency(svc.basePrice)}
                  </td>
                  <td>
                    <span className={`badge ${svc.isActive ? 'badge--completed' : 'badge--cancelled'}`}>
                      {svc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => openEdit(svc)} title="Edit Service">
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn--ghost btn--sm"
                        style={{ color: svc.isActive ? 'var(--color-warning)' : 'var(--color-success)' }}
                        onClick={() => handleToggle(svc)}
                        title={svc.isActive ? 'Deactivate Service' : 'Activate Service'}
                      >
                        {svc.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        className="btn btn--ghost btn--sm"
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => openDeleteConfirm(svc)}
                        title="Delete Service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => !isSubmitting && setShowModal(false)} title={editingId ? 'Edit Service' : 'Add Service'}>
        {modalApiError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px 14px',
            borderRadius: '6px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fca5a5'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{modalApiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label--required">Service Name</label>
            <input
              className={`form-input ${errors.serviceName ? 'form-input--error' : ''}`}
              value={form.serviceName}
              onChange={(e) => {
                setForm({ ...form, serviceName: e.target.value })
                if (errors.serviceName) setErrors({ ...errors, serviceName: '' })
              }}
              placeholder="e.g. AC Repair"
            />
            {errors.serviceName && <span className="form-error">{errors.serviceName}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label form-label--required">Category</label>
              <select
                className={`form-select ${errors.category ? 'form-select--error' : ''}`}
                value={form.category}
                onChange={(e) => {
                  setForm({ ...form, category: e.target.value })
                  if (errors.category) setErrors({ ...errors, category: '' })
                }}
              >
                <option value="Cooling">Cooling</option>
                <option value="Appliances">Appliances</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Security">Security</option>
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label className="form-label form-label--required">Price (₹)</label>
              <input
                type="number"
                min="1"
                step="any"
                className={`form-input ${errors.basePrice ? 'form-input--error' : ''}`}
                value={form.basePrice}
                onChange={(e) => {
                  setForm({ ...form, basePrice: e.target.value })
                  if (errors.basePrice) setErrors({ ...errors, basePrice: '' })
                }}
                placeholder="499"
              />
              {errors.basePrice && <span className="form-error">{errors.basePrice}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label form-label--required">Estimated Duration (Hours)</label>
            <input
              type="number"
              min="1"
              max="24"
              className={`form-input ${errors.estimatedHours ? 'form-input--error' : ''}`}
              value={form.estimatedHours}
              onChange={(e) => {
                setForm({ ...form, estimatedHours: e.target.value })
                if (errors.estimatedHours) setErrors({ ...errors, estimatedHours: '' })
              }}
            />
            {errors.estimatedHours && <span className="form-error">{errors.estimatedHours}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label--required">Description</label>
            <textarea
              className={`form-textarea ${errors.description ? 'form-textarea--error' : ''}`}
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value })
                if (errors.description) setErrors({ ...errors, description: '' })
              }}
              placeholder="What does this service include?"
              rows={3}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isSubmitting && setShowDeleteModal(false)}
        title="Delete Service?"
        size="sm"
      >
        {deletingService && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{deletingService.serviceName}</strong>? This action cannot be undone.
            </p>
            <div className="form-actions">
              <button type="button" className="btn btn--outline" onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="button" className="btn btn--danger" onClick={handleDeleteConfirm} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete Service'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}

export default ManagementServicesPage
