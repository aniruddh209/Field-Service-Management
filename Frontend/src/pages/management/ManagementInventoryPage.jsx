import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, ChevronRight, AlertTriangle } from 'lucide-react'
import { getInventoryItems, createInventoryItem, updateInventoryItem, adjustStock } from '../../services/inventoryService.js'
import { formatCurrency } from '../../utils/format.js'
import Modal from '../../components/ui/Modal.jsx'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

const EMPTY_FORM = { sku: '', name: '', category: 'AC Parts', quantityInStock: 0, reorderLevel: 2, unitPrice: 0 }

function ManagementInventoryPage() {
  const [inventory, setInventory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [stockChange, setStockChange] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  async function load() {
    setIsLoading(true)
    const data = await getInventoryItems()
    setInventory(data)
    setIsLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = inventory.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowModal(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      sku: item.sku,
      name: item.name,
      category: item.category,
      quantityInStock: item.quantityInStock,
      reorderLevel: item.reorderLevel,
      unitPrice: item.unitPrice
    })
    setErrors({})
    setShowModal(true)
  }

  function openStockAdjust(item) {
    setSelectedItem(item)
    setStockChange(0)
    setShowStockModal(true)
  }

  function validate() {
    const e = {}
    if (!form.sku.trim()) e.sku = 'SKU is required'
    if (!form.name.trim()) e.name = 'Name is required'
    if (form.quantityInStock < 0) e.quantityInStock = 'Must be positive or zero'
    if (form.reorderLevel < 0) e.reorderLevel = 'Must be positive or zero'
    if (form.unitPrice <= 0) e.unitPrice = 'Must be positive price'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    const data = {
      ...form,
      quantityInStock: Number(form.quantityInStock),
      reorderLevel: Number(form.reorderLevel),
      unitPrice: Number(form.unitPrice)
    }

    if (editingId) {
      await updateInventoryItem(editingId, data)
    } else {
      await createInventoryItem(data)
    }
    setShowModal(false)
    load()
  }

  async function handleAdjustStockSubmit(e) {
    e.preventDefault()
    if (!selectedItem) return
    await adjustStock(selectedItem.id, Number(stockChange))
    setShowStockModal(false)
    load()
  }

  if (isLoading) return <PageContainer><LoadingState message="Loading inventory..." /></PageContainer>

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">Inventory Management</h1>
          <p className="page-header__subtitle">Manage spare parts, stock levels, and pricing</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={openAdd}>
            <Plus size={16} /> Add Spare Part
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-bar__search">
          <Search size={16} className="filters-bar__search-icon" />
          <input
            className="filters-bar__search-input"
            placeholder="Search inventory by SKU, name, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No items found" message="Try adjusting your filters or add a new spare part." />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU / Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isLow = item.quantityInStock <= item.reorderLevel
                const isOut = item.quantityInStock === 0

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{item.sku}</div>
                    </td>
                    <td>{item.category}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(item.unitPrice)}</td>
                    <td>
                      <strong>{item.quantityInStock}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: 4 }}>
                        (Min: {item.reorderLevel})
                      </span>
                    </td>
                    <td>
                      {isOut ? (
                        <span className="badge badge--cancelled" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={12} /> Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="badge badge--pending" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="badge badge--completed">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn btn--outline btn--sm" onClick={() => openStockAdjust(item)}>
                          Adjust Stock
                        </button>
                        <button className="btn btn--ghost btn--sm" onClick={() => openEdit(item)} title="Edit">
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Spare Part' : 'Add Spare Part'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label--required">Part Name</label>
            <input
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Capacitor 35uF"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label form-label--required">SKU Code</label>
              <input
                className={`form-input ${errors.sku ? 'form-input--error' : ''}`}
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                placeholder="PART-AC-005"
              />
              {errors.sku && <span className="form-error">{errors.sku}</span>}
            </div>
            <div className="form-group">
              <label className="form-label form-label--required">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option value="AC Parts">AC Parts</option>
                <option value="Plumbing Parts">Plumbing Parts</option>
                <option value="Electrical Parts">Electrical Parts</option>
                <option value="CCTV Parts">CCTV Parts</option>
                <option value="Appliance Parts">Appliance Parts</option>
                <option value="Water Purifier Parts">Water Purifier Parts</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label form-label--required">Unit Price (₹)</label>
              <input
                type="number"
                className={`form-input ${errors.unitPrice ? 'form-input--error' : ''}`}
                value={form.unitPrice}
                onChange={e => setForm({ ...form, unitPrice: e.target.value })}
              />
              {errors.unitPrice && <span className="form-error">{errors.unitPrice}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Initial Stock Quantity</label>
              <input
                type="number"
                className={`form-input ${errors.quantityInStock ? 'form-input--error' : ''}`}
                value={form.quantityInStock}
                onChange={e => setForm({ ...form, quantityInStock: e.target.value })}
                disabled={!!editingId}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reorder / Safety Stock Level</label>
            <input
              type="number"
              className="form-input"
              value={form.reorderLevel}
              onChange={e => setForm({ ...form, reorderLevel: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn--primary">{editingId ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal isOpen={showStockModal} onClose={() => setShowStockModal(false)} title="Adjust Stock Quantity">
        {selectedItem && (
          <form onSubmit={handleAdjustStockSubmit}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              Current stock level for <strong>{selectedItem.name}</strong> is <strong>{selectedItem.quantityInStock}</strong> units.
            </p>
            <div className="form-group">
              <label className="form-label">Quantity Change</label>
              <input
                type="number"
                className="form-input"
                value={stockChange}
                onChange={e => setStockChange(Number(e.target.value))}
                placeholder="e.g. +5 to add, -2 to reduce"
              />
              <span className="form-hint">Use positive numbers to add stock, negative to subtract stock.</span>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn--outline" onClick={() => setShowStockModal(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Update Stock</button>
            </div>
          </form>
        )}
      </Modal>
    </PageContainer>
  )
}

export default ManagementInventoryPage
