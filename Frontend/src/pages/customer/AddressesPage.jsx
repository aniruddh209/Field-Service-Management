import { useState, useEffect } from 'react'
import { MapPin, Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getMyAddresses, createAddress, updateAddress, deleteAddress } from '../../services/addressService.js'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import Modal from '../../components/ui/Modal.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

const EMPTY_FORM = { label: 'Home', contactName: '', phoneNumber: '', addressLine1: '', addressLine2: '', city: '', state: 'Gujarat', postalCode: '', landmark: '' }

function AddressesPage() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [modalApiError, setModalApiError] = useState('')
  const [pageError, setPageError] = useState('')

  const userFullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Customer'
  const userPhone = user?.phoneNumber || user?.phone || ''

  async function load() {
    setIsLoading(true)
    try {
      const data = await getMyAddresses()
      setAddresses(data || [])
    } catch (err) {
      console.error("Failed to load addresses:", err)
      setAddresses([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { if (user?.id) load() }, [user?.id])

  function openAdd() {
    setEditingId(null)
    setForm({
      ...EMPTY_FORM,
      contactName: userFullName,
      phoneNumber: userPhone
    })
    setErrors({})
    setModalApiError('')
    setShowModal(true)
  }

  function openEdit(addr) {
    setEditingId(addr.id)
    setForm({
      label: addr.addressTitle || addr.label || 'Home',
      contactName: userFullName,
      phoneNumber: userPhone,
      addressLine1: addr.addressLine || addr.addressLine1 || '',
      addressLine2: addr.area || addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || 'Gujarat',
      postalCode: addr.pincode || addr.postalCode || '',
      landmark: addr.landmark || ''
    })
    setErrors({})
    setModalApiError('')
    setShowModal(true)
  }

  function validate() {
    const e = {}
    if (!form.label.trim()) e.label = 'Title is required'
    if (!form.addressLine1.trim()) e.addressLine1 = 'Address line is required'
    if (!form.addressLine2.trim()) e.addressLine2 = 'Area / Locality is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state.trim()) e.state = 'State is required'
    if (!form.postalCode.trim() || !/^\d{6}$/.test(form.postalCode.trim())) {
      e.postalCode = 'Pincode must contain 6 digits'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setModalApiError('')
    if (!validate()) return

    setSubmitting(true)
    const payload = {
      addressTitle: form.label.trim(),
      addressLine: form.addressLine1.trim(),
      area: form.addressLine2.trim(),
      city: form.city.trim(),
      state: form.state.trim() || 'Gujarat',
      pincode: form.postalCode.trim(),
      landmark: form.landmark.trim() || null
    }

    try {
      if (editingId) {
        await updateAddress(editingId, payload)
      } else {
        await createAddress(payload)
      }
      setShowModal(false)
      load()
    } catch (err) {
      console.error("Address save error:", err)
      const msg = err.response?.data?.message || (err.response?.data?.errors ? err.response.data.errors.map(x => x.message).join(' ') : null) || err.message || "Failed to save address."
      setModalApiError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    setPageError('')
    try {
      await deleteAddress(deletingId)
      setShowConfirm(false)
      setDeletingId(null)
      load()
    } catch (err) {
      console.error("Address delete error:", err)
      setPageError(err.message || "Failed to delete address.")
      setShowConfirm(false)
    }
  }

  if (isLoading) return <PageContainer><LoadingState message="Loading addresses..." /></PageContainer>

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">My Addresses</h1>
          <p className="page-header__subtitle">Manage your service locations</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={openAdd}><Plus size={16} /> Add Address</button>
        </div>
      </div>

      {pageError && (
        <div style={{ padding: '12px 16px', background: 'var(--color-danger-light)', border: '1px solid var(--color-danger)', borderRadius: 8, color: 'var(--color-danger)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={18} />
          <span>{pageError}</span>
        </div>
      )}

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No addresses yet" message="Add a service location to get started." actionLabel="Add Address" onAction={openAdd} />
      ) : (
        <div className="cards-grid">
          {addresses.map(addr => {
            const displayTitle = addr.addressTitle || addr.label || 'Home'
            const displayAddress1 = addr.addressLine || addr.addressLine1 || ''
            const displayArea = addr.area || addr.addressLine2 || ''
            const displayPincode = addr.pincode || addr.postalCode || ''

            return (
              <div key={addr.id} className="data-card">
                <div className="data-card__header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{displayTitle}</h3>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => openEdit(addr)} title="Edit"><Edit size={14} /></button>
                    <button className="btn btn--ghost btn--sm" style={{ color: 'var(--color-danger)' }} onClick={() => { setDeletingId(addr.id); setShowConfirm(true) }} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="data-card__body">
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--color-text)' }}>{userFullName}</strong>
                    {userPhone ? ` · ${userPhone}` : ''}<br />
                    {displayAddress1}{displayArea ? `, ${displayArea}` : ''}<br />
                    {addr.city}, {addr.state} {displayPincode}
                    {addr.landmark && <><br />Near: {addr.landmark}</>}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => !submitting && setShowModal(false)} title={editingId ? 'Edit Address' : 'Add Address'}>
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
            <label className="form-label form-label--required">Title / Label</label>
            <input className={`form-input ${errors.label ? 'form-input--error' : ''}`} value={form.label} onChange={e => { setForm({ ...form, label: e.target.value }); if (errors.label) setErrors({ ...errors, label: '' }) }} placeholder="e.g. Home, Office" />
            {errors.label && <span className="form-error">{errors.label}</span>}
          </div>
          <div className="form-group">
            <label className="form-label form-label--required">Address Line (House / Flat / Street)</label>
            <input className={`form-input ${errors.addressLine1 ? 'form-input--error' : ''}`} value={form.addressLine1} onChange={e => { setForm({ ...form, addressLine1: e.target.value }); if (errors.addressLine1) setErrors({ ...errors, addressLine1: '' }) }} placeholder="e.g. Flat 402, Sunshine Apartments" />
            {errors.addressLine1 && <span className="form-error">{errors.addressLine1}</span>}
          </div>
          <div className="form-group">
            <label className="form-label form-label--required">Area / Locality</label>
            <input className={`form-input ${errors.addressLine2 ? 'form-input--error' : ''}`} value={form.addressLine2} onChange={e => { setForm({ ...form, addressLine2: e.target.value }); if (errors.addressLine2) setErrors({ ...errors, addressLine2: '' }) }} placeholder="e.g. Navrangpura, Ratanpar" />
            {errors.addressLine2 && <span className="form-error">{errors.addressLine2}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label form-label--required">City</label>
              <input className={`form-input ${errors.city ? 'form-input--error' : ''}`} value={form.city} onChange={e => { setForm({ ...form, city: e.target.value }); if (errors.city) setErrors({ ...errors, city: '' }) }} placeholder="e.g. Rajkot" />
              {errors.city && <span className="form-error">{errors.city}</span>}
            </div>
            <div className="form-group">
              <label className="form-label form-label--required">State</label>
              <input className={`form-input ${errors.state ? 'form-input--error' : ''}`} value={form.state} onChange={e => { setForm({ ...form, state: e.target.value }); if (errors.state) setErrors({ ...errors, state: '' }) }} placeholder="Gujarat" />
              {errors.state && <span className="form-error">{errors.state}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label form-label--required">Pincode</label>
              <input className={`form-input ${errors.postalCode ? 'form-input--error' : ''}`} value={form.postalCode} onChange={e => { setForm({ ...form, postalCode: e.target.value }); if (errors.postalCode) setErrors({ ...errors, postalCode: '' }) }} placeholder="360003" />
              {errors.postalCode && <span className="form-error">{errors.postalCode}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Landmark (Optional)</label>
              <input className="form-input" value={form.landmark} onChange={e => setForm({ ...form, landmark: e.target.value })} placeholder="Near temple..." />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Address'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} title="Delete Address" message="Are you sure you want to delete this address? This action cannot be undone." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />
    </PageContainer>
  )
}

export default AddressesPage
