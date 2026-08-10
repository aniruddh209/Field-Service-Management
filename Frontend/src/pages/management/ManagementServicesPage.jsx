import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, ToggleLeft, ToggleRight } from 'lucide-react'
import { getServices, createService, updateService, toggleServiceActive } from '../../services/serviceCatalogService.js'
import { formatCurrency } from '../../utils/format.js'
import Modal from '../../components/ui/Modal.jsx'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

const EMPTY_FORM = {
  serviceName: '',
  category: '',
  description: '',
  basePrice: '',
  estimatedHours: 1,
  image: '',
  isActive: true
}

function ManagementServicesPage() {
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

async function load() {
  try {
    setIsLoading(true);

    const data = await getServices();

    console.log("Services from API:", data);

    setServices(data);

    console.log("State will become:", data);

  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
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
    setShowModal(true)
  }

  function openEdit(svc) {
    setEditingId(svc.id)

    setForm({
      serviceName: svc.serviceName,
      category: svc.category,
      description: svc.description,
      basePrice: svc.basePrice,
      estimatedHours: svc.estimatedHours,
      image: svc.image || '',
      isActive: svc.isActive
    })

    setErrors({})
    setShowModal(true)
  }

  async function handleToggle(id) {
    await toggleServiceActive(id)
    await load()
  }

  function validate() {
    const e = {}

    if (!form.serviceName.trim())
      e.serviceName = "Service Name is required"

    if (!form.category.trim())
      e.category = "Category is required"

    if (!form.description.trim())
      e.description = "Description is required"

    if (!form.basePrice || Number(form.basePrice) <= 0)
      e.basePrice = "Enter valid price"

    if (!form.estimatedHours || Number(form.estimatedHours) <= 0)
      e.estimatedHours = "Enter valid hours"

    setErrors(e)

    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    const data = {
      ...form,
      basePrice: Number(form.basePrice),
      estimatedHours: Number(form.estimatedHours)
    }

    if (editingId) {
      await updateService(editingId, {
        id: editingId,
        ...data
      })
    } else {
      await createService(data)
    }
    setShowModal(false)
    setForm(EMPTY_FORM)
    await load()
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
              className={`form-input ${errors.serviceName ? 'form-input--error' : ''}`}
              value={form.serviceName}
              onChange={(e) =>
                setForm({
                  ...form,
                  serviceName: e.target.value
                })
              }
              placeholder="e.g. AC Repair"
            />

            {errors.serviceName && (
              <span className="form-error">
                {errors.serviceName}
              </span>
            )}
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
                className={`form-input ${errors.basePrice ? 'form-input--error' : ''}`}
                value={form.basePrice}
                onChange={(e) =>
                  setForm({
                    ...form,
                    basePrice: e.target.value
                  })
                }
                placeholder="499"
              />

              {errors.basePrice && (
                <span className="form-error">
                  {errors.basePrice}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Duration (Hours)</label>
            <input
              type="number"
              className="form-input"
              value={form.estimatedHours}
              onChange={(e) =>
                setForm({
                  ...form,
                  estimatedHours: Number(e.target.value)
                })
              }
            />

            {errors.estimatedHours && (
              <span className="form-error">
                {errors.estimatedHours}
              </span>
            )}
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
