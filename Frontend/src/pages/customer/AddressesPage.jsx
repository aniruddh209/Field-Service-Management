import { useState, useEffect } from 'react'
import { MapPin, Plus, Edit, Trash2, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getMyAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../services/addressService.js'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import Modal from '../../components/ui/Modal.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

const EMPTY_FORM = { label: '', contactName: '', phoneNumber: '', addressLine1: '', addressLine2: '', city: '', state: 'Gujarat', postalCode: '', landmark: '', isDefault: false }

function AddressesPage() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const userFullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Customer'
  const userPhone = user?.phoneNumber || user?.phone || ''

  async function load() {
    setIsLoading(true)
    const data = await getMyAddresses(user?.id)
    setAddresses(data)
    setIsLoading(false)
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
    setShowModal(true)
  }

  function openEdit(addr) {
    setEditingId(addr.id)
    setForm({
      label: addr.label || addr.addressTitle || 'Home',
      contactName: addr.contactName || userFullName,
      phoneNumber: addr.phoneNumber || userPhone,
      addressLine1: addr.addressLine1 || addr.addressLine || '',
      addressLine2: addr.addressLine2 || addr.area || '',
      city: addr.city || '',
      state: addr.state || 'Gujarat',
      postalCode: addr.postalCode || addr.pincode || '',
      landmark: addr.landmark || '',
      isDefault: !!addr.isDefault
    })
    setErrors({})
    setShowModal(true)
  }

  function validate() {
    const e = {}
    if (!form.label.trim()) e.label = 'Label is required'
    if (!form.contactName.trim()) e.contactName = 'Contact name is required'
    if (!form.phoneNumber.trim()) e.phoneNumber = 'Phone is required'
    if (!form.addressLine1.trim()) e.addressLine1 = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.postalCode.trim()) e.postalCode = 'Postal code is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    const data = { ...form, customerId: user.id }
    if (editingId) {
      await updateAddress(editingId, data)
    } else {
      await createAddress(data)
    }
    setShowModal(false)
    load()
  }

  async function handleDelete() {
    await deleteAddress(deletingId)
    setShowConfirm(false)
    setDeletingId(null)
    load()
  }

  async function handleSetDefault(addressId) {
    await setDefaultAddress(user.id, addressId)
    load()
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

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No addresses yet" message="Add a service location to get started." actionLabel="Add Address" onAction={openAdd} />
      ) : (
        <div className="cards-grid">
          {addresses.map(addr => {
            const displayName = addr.contactName || userFullName
            const displayPhone = addr.phoneNumber || userPhone
            const displayAddress1 = addr.addressLine1 || addr.addressLine || ''
            const displayAddress2 = addr.addressLine2 || addr.area || ''
            const displayPincode = addr.postalCode || addr.pincode || ''

            return (
              <div key={addr.id} className="data-card">
                <div className="data-card__header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{addr.label || addr.addressTitle || 'Home'}</h3>
                      {addr.isDefault && <span className="badge badge--completed" style={{ fontSize: '0.68rem' }}>Default</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {!addr.isDefault && (
                      <button className="btn btn--ghost btn--sm" onClick={() => handleSetDefault(addr.id)} title="Set as default"><Star size={14} /></button>
                    )}
                    <button className="btn btn--ghost btn--sm" onClick={() => openEdit(addr)} title="Edit"><Edit size={14} /></button>
                    <button className="btn btn--ghost btn--sm" style={{ color: 'var(--color-danger)' }} onClick={() => { setDeletingId(addr.id); setShowConfirm(true) }} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="data-card__body">
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--color-text)' }}>{displayName}</strong>
                    {displayPhone ? ` · ${displayPhone}` : ''}<br />
                    {displayAddress1}{displayAddress2 ? `, ${displayAddress2}` : ''}<br />
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Address' : 'Add Address'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label--required">Label</label>
            <input className={`form-input ${errors.label ? 'form-input--error' : ''}`} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="e.g. Home, Office" />
            {errors.label && <span className="form-error">{errors.label}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label form-label--required">Contact Name</label>
              <input className={`form-input ${errors.contactName ? 'form-input--error' : ''}`} value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} />
              {errors.contactName && <span className="form-error">{errors.contactName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label form-label--required">Phone Number</label>
              <input className={`form-input ${errors.phoneNumber ? 'form-input--error' : ''}`} value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
              {errors.phoneNumber && <span className="form-error">{errors.phoneNumber}</span>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label form-label--required">Address Line 1</label>
            <input className={`form-input ${errors.addressLine1 ? 'form-input--error' : ''}`} value={form.addressLine1} onChange={e => setForm({ ...form, addressLine1: e.target.value })} />
            {errors.addressLine1 && <span className="form-error">{errors.addressLine1}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Address Line 2 (Area/Locality)</label>
            <input className="form-input" value={form.addressLine2} onChange={e => setForm({ ...form, addressLine2: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label form-label--required">City</label>
              <input className={`form-input ${errors.city ? 'form-input--error' : ''}`} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label form-label--required">Postal Code</label>
              <input className={`form-input ${errors.postalCode ? 'form-input--error' : ''}`} value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Landmark</label>
              <input className="form-input" value={form.landmark} onChange={e => setForm({ ...form, landmark: e.target.value })} placeholder="Near..." />
            </div>
          </div>
          <label className="form-checkbox">
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
            Set as default address
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn--primary">{editingId ? 'Save Changes' : 'Add Address'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} title="Delete Address" message="Are you sure you want to delete this address? This action cannot be undone." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />
    </PageContainer>
  )
}

export default AddressesPage
