import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, Check } from 'lucide-react'
import { getServices, createService, updateService, toggleServiceActive } from '../../services/serviceCatalogService.js'
import { formatCurrency } from '../../utils/format.js'
import Modal from '../../components/ui/Modal.jsx'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

const EMPTY_FORM = { name: '', description: '', price: '', category: 'Cooling', estimatedDurationHours: 1 }

function ManagementServicesPage() {
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  async function load() {
    setIsLoading(true)
    const data = await getServices(true) // Get all services including inactive
    setServices(data)
    setIsLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowModal(true)
  }

  function openEdit(svc) {
    setEditingId(svc.id)
    setForm({
      name: svc.name,
      description: svc.description,
      price: svc.price || svc.startingPrice || '',
      category: svc.category,
      estimatedDurationHours: svc.estimatedDurationHours || 1
    })
    setErrors({})
    setShowModal(true)
  }

  async function handleToggle(id) {
    await toggleServiceActive(id)
    load()
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid price is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    const data = {
      ...form,
      price: Number(form.price)
    }

    if (editingId) {
      await updateService(editingId, data)
    } else {
      await createService(data)
    }
    setShowModal(false)
    load()
  }

  if (isLoading) return <PageContainer><LoadingState message="Loading services..." /></PageContainer>

  return (
    <PageContainer>
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
                  <td style={{ fontWeight: 600 }}>{svc.name}</td>
                  <td>{svc.category}</td>
                  <td>{svc.estimatedDurationHours} hr{svc.estimatedDurationHours !== 1 ? 's' : ''}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {formatCurrency(svc.price || svc.startingPrice)}
                  </td>
                  <td>
                    <span className={`badge ${svc.isActive ? 'badge--completed' : 'badge--cancelled'}`}>
                      {svc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => openEdit(svc)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn--ghost btn--sm"
                        style={{ color: svc.isActive ? 'var(--color-danger)' : 'var(--color-success)' }}
                        onClick={() => handleToggle(svc.id)}
                        title={svc.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {svc.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Service' : 'Add Service'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label--required">Service Name</label>
            <input
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Deep Cleaning Service"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label form-label--required">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option value="Cooling">Cooling</option>
                <option value="Appliances">Appliances</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Security">Security</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label form-label--required">Price (₹)</label>
              <input
                type="number"
                className={`form-input ${errors.price ? 'form-input--error' : ''}`}
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="499"
              />
              {errors.price && <span className="form-error">{errors.price}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Duration (Hours)</label>
            <input
              type="number"
              step="0.5"
              className="form-input"
              value={form.estimatedDurationHours}
              onChange={e => setForm({ ...form, estimatedDurationHours: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label--required">Description</label>
            <textarea
              className={`form-textarea ${errors.description ? 'form-textarea--error' : ''}`}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What does this service include?"
              rows={3}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn--primary">{editingId ? 'Save Changes' : 'Add Service'}</button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  )
}

export default ManagementServicesPage
