import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Wrench, MapPin, Package, Calendar, FileText, Send, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getServices, getAvailableServices } from '../../services/serviceCatalogService.js'
import { getMyAddresses } from '../../services/addressService.js'
import { getMyAssets } from '../../services/assetService.js'
import { createServiceRequest } from '../../services/serviceRequestService.js'
import { formatCurrency } from '../../utils/format.js'
import PageContainer from '../../components/layout/PageContainer.jsx'
import './NewRequestPage.css'

function NewRequestPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  // Read pre-selected service from location state or query parameters
  const preSelectedService = location.state?.selectedService || null
  const queryServiceId = searchParams.get('serviceId') || location.state?.serviceId || (preSelectedService ? preSelectedService.id : '')

  const [services, setServices] = useState([])
  const [addresses, setAddresses] = useState([])
  const [assets, setAssets] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    serviceId: queryServiceId ? Number(queryServiceId) : '',
    addressId: '',
    assetId: '',
    preferredDate: '',
    preferredTime: '',
    problemTitle: '',
    problemDescription: ''
  })

  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [newRequest, setNewRequest] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [svcData, addrData, assetData] = await Promise.all([
          getAvailableServices().catch(() => getServices()),
          getMyAddresses(),
          getMyAssets()
        ])
        const activeOnly = (svcData || []).filter(s => s.isActive !== false)
        setServices(activeOnly)
        setAddresses(addrData || [])
        setAssets(assetData || [])

        // Pre-select service ID if passed from Book Service, else default to first service
        const initialSvcId = queryServiceId ? Number(queryServiceId) : (svcData && svcData.length > 0 ? svcData[0].id : '')
        if (initialSvcId) {
          setForm(f => ({ ...f, serviceId: initialSvcId }))
        }

        // Auto-select first address if available
        if (addrData && addrData.length > 0) {
          setForm(f => ({ ...f, addressId: addrData[0].id }))
        }
      } catch (err) {
        console.error('Failed to load form options:', err)
      }
    }
    if (user?.id) load()
  }, [user?.id, queryServiceId])

  const selectedService = services.find(s => s.id === Number(form.serviceId)) || preSelectedService
  const selectedAddress = addresses.find(a => a.id === Number(form.addressId))
  const selectedAsset = assets.find(a => a.id === Number(form.assetId))

  function validate() {
    const e = {}
    if (!form.serviceId) e.serviceId = 'Please select a service'
    if (!form.addressId && addresses.length > 0) e.addressId = 'Please select a service address'
    if (!form.preferredDate) e.preferredDate = 'Please select a preferred date'
    if (!form.problemTitle.trim()) e.problemTitle = 'Problem title is required'
    const fullDesc = `${form.problemTitle.trim()}: ${form.problemDescription.trim()}`
    if (fullDesc.length < 10) e.problemDescription = 'Problem description must be at least 10 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    try {
      setSubmitting(true)
      setErrors({})

      const formattedAddress = selectedAddress
        ? `${selectedAddress.addressLine1 || selectedAddress.addressLine || ''}, ${selectedAddress.city || ''}, ${selectedAddress.state || ''} ${selectedAddress.postalCode || ''}`.trim()
        : 'Service Address Provided'

      const fullProblemDescription = form.problemDescription.trim() 
        ? `${form.problemTitle.trim()} - ${form.problemDescription.trim()}`
        : form.problemTitle.trim()

      const notesParts = []
      if (form.preferredTime) notesParts.push(`Time Slot: ${form.preferredTime}`)
      if (selectedAsset) notesParts.push(`Asset: ${selectedAsset.assetName || selectedAsset.name} (${selectedAsset.modelNumber || selectedAsset.model || ''})`)
      
      const payload = {
        serviceId: Number(form.serviceId),
        problemDescription: fullProblemDescription.length >= 10 ? fullProblemDescription : `${fullProblemDescription} (Detailed request)`,
        serviceAddress: formattedAddress.length > 0 ? formattedAddress : 'Customer Default Address',
        preferredDate: new Date(form.preferredDate).toISOString(),
        notes: notesParts.length > 0 ? notesParts.join(' | ') : null
      }

      const result = await createServiceRequest(payload)
      setNewRequest(result)
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit request:', err)
      const message = err.response?.data?.message || err.response?.data?.title || 'Failed to submit service request. Please check required fields.'
      setErrors({ submit: message })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '48px 16px', maxWidth: 600, margin: '0 auto' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--color-success-light)', color: 'var(--color-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Check size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Request Submitted Successfully!</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Your service request has been created and saved to the system.
          </p>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', marginBottom: 24 }}>
            Our operations team will review your request shortly and assign an expert technician.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn--outline" onClick={() => navigate('/customer/requests')}>View My Requests</button>
            <button className="btn btn--primary" onClick={() => navigate('/customer/dashboard')}>Go to Dashboard</button>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <button className="btn btn--ghost btn--sm" onClick={() => navigate('/customer/requests')} style={{ marginBottom: 12 }}>
        <ArrowLeft size={16} /> Back to My Requests
      </button>

      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 className="page-header__title">Create New Service Request</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Fill out the form below to quickly request service in one step.
        </p>
      </div>

      {errors.submit && (
        <div style={{ padding: 12, background: 'var(--color-danger-light)', border: '1px solid var(--color-danger)', borderRadius: 8, color: 'var(--color-danger)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={18} />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="single-request-form-layout">
        {/* Main Form Fields Column */}
        <div className="single-request-main">

          {/* Card 1: Service & Equipment Details */}
          <div className="form-card">
            <div className="form-card__header">
              <Wrench size={18} className="form-card__icon" />
              <h3>Service & Address Selection</h3>
            </div>
            <div className="form-card__body">

              {/* Service Selection */}
              <div className="form-group">
                <label className="form-label form-label--required">Selected Service</label>
                <select
                  className={`form-select ${errors.serviceId ? 'form-select--error' : ''}`}
                  value={form.serviceId}
                  onChange={e => {
                    setForm(f => ({ ...f, serviceId: Number(e.target.value) }))
                    if (errors.serviceId) setErrors(err => ({ ...err, serviceId: null }))
                  }}
                >
                  <option value="">-- Select Service --</option>
                  {services.map(svc => (
                    <option key={svc.id} value={svc.id}>
                      {svc.serviceName || svc.name} ({formatCurrency(svc.basePrice || svc.price || 0)})
                    </option>
                  ))}
                </select>
                {errors.serviceId && <span className="form-error">{errors.serviceId}</span>}
                {selectedService && (
                  <div style={{ marginTop: 8, fontSize: '0.84rem', color: 'var(--color-text-secondary)', background: 'var(--color-surface-hover)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{selectedService.serviceName || selectedService.name}</strong> ({selectedService.category || 'General'})
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{selectedService.description}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                      {formatCurrency(selectedService.basePrice || selectedService.price || 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Service Address Select */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="form-label form-label--required" style={{ margin: 0 }}>Service Address</label>
                  <button type="button" className="btn-link" onClick={() => navigate('/customer/addresses')} style={{ fontSize: '0.8rem', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}>
                    + Manage Addresses
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <div style={{ padding: 12, background: 'var(--color-warning-light)', borderRadius: 6, fontSize: '0.85rem' }}>
                    No saved addresses found.{' '}
                    <button type="button" className="btn-link" onClick={() => navigate('/customer/addresses')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>Click here to add an address</button>.
                  </div>
                ) : (
                  <select
                    className={`form-select ${errors.addressId ? 'form-select--error' : ''}`}
                    value={form.addressId}
                    onChange={e => {
                      setForm(f => ({ ...f, addressId: Number(e.target.value) }))
                      if (errors.addressId) setErrors(err => ({ ...err, addressId: null }))
                    }}
                  >
                    <option value="">-- Select Address --</option>
                    {addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.addressLine1 || addr.addressLine}, {addr.city} ({addr.postalCode})
                      </option>
                    ))}
                  </select>
                )}
                {errors.addressId && <span className="form-error">{errors.addressId}</span>}
              </div>

              {/* Equipment / Asset Select (Optional) */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Related Equipment / Asset (Optional)</label>
                <select
                  className="form-select"
                  value={form.assetId}
                  onChange={e => setForm(f => ({ ...f, assetId: e.target.value ? Number(e.target.value) : '' }))}
                >
                  <option value="">None / Not Applicable</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.assetName || asset.name} ({asset.category || asset.brand || 'Asset'} {asset.modelNumber ? `· ${asset.modelNumber}` : ''})
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Card 2: Schedule */}
          <div className="form-card">
            <div className="form-card__header">
              <Calendar size={18} className="form-card__icon" />
              <h3>Preferred Schedule</h3>
            </div>
            <div className="form-card__body grid-2-col">
              <div className="form-group">
                <label className="form-label form-label--required">Preferred Date</label>
                <input
                  type="date"
                  className={`form-input ${errors.preferredDate ? 'form-input--error' : ''}`}
                  value={form.preferredDate}
                  onChange={e => {
                    setForm(f => ({ ...f, preferredDate: e.target.value }))
                    if (errors.preferredDate) setErrors(err => ({ ...err, preferredDate: null }))
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.preferredDate && <span className="form-error">{errors.preferredDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Time Slot (Optional)</label>
                <select
                  className="form-select"
                  value={form.preferredTime}
                  onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))}
                >
                  <option value="">-- Select Time Slot --</option>
                  <option value="09:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 01:00 PM">12:00 PM - 1:00 PM</option>
                  <option value="02:00 PM - 03:00 PM">2:00 PM - 3:00 PM</option>
                  <option value="04:00 PM - 05:00 PM">4:00 PM - 5:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Problem Description */}
          <div className="form-card">
            <div className="form-card__header">
              <FileText size={18} className="form-card__icon" />
              <h3>Problem Details</h3>
            </div>
            <div className="form-card__body">
              <div className="form-group">
                <label className="form-label form-label--required">Problem Title</label>
                <input
                  type="text"
                  className={`form-input ${errors.problemTitle ? 'form-input--error' : ''}`}
                  value={form.problemTitle}
                  onChange={e => {
                    setForm(f => ({ ...f, problemTitle: e.target.value }))
                    if (errors.problemTitle) setErrors(err => ({ ...err, problemTitle: null }))
                  }}
                  placeholder="e.g. Air Conditioner is not cooling / unusual noise"
                />
                {errors.problemTitle && <span className="form-error">{errors.problemTitle}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Detailed Problem Description</label>
                <textarea
                  className={`form-textarea ${errors.problemDescription ? 'form-textarea--error' : ''}`}
                  value={form.problemDescription}
                  onChange={e => {
                    setForm(f => ({ ...f, problemDescription: e.target.value }))
                    if (errors.problemDescription) setErrors(err => ({ ...err, problemDescription: null }))
                  }}
                  placeholder="Please describe symptoms, error codes, or specific issues..."
                  rows={4}
                />
                {errors.problemDescription && <span className="form-error">{errors.problemDescription}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary & Action Panel */}
        <div className="single-request-sidebar">
          <div className="summary-card">
            <h3 className="summary-card__title">Request Summary</h3>

            <div className="summary-list">
              <div className="summary-item">
                <span className="summary-item__label">Service</span>
                <span className="summary-item__value">
                  {selectedService ? (selectedService.serviceName || selectedService.name) : <em style={{ color: 'var(--color-text-tertiary)' }}>Not selected</em>}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-item__label">Starting Price</span>
                <span className="summary-item__value highlight">
                  {selectedService
                    ? formatCurrency(selectedService.basePrice || selectedService.price || 0)
                    : '—'}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-item__label">Address</span>
                <span className="summary-item__value">
                  {selectedAddress ? `${selectedAddress.addressLine1 || selectedAddress.addressLine} (${selectedAddress.city})` : <em style={{ color: 'var(--color-text-tertiary)' }}>Not selected</em>}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-item__label">Equipment</span>
                <span className="summary-item__value">
                  {selectedAsset ? (selectedAsset.assetName || selectedAsset.name) : 'None'}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-item__label">Preferred Date</span>
                <span className="summary-item__value">
                  {form.preferredDate || <em style={{ color: 'var(--color-text-tertiary)' }}>Not selected</em>}
                </span>
              </div>
            </div>

            <div className="summary-card__actions">
              <button
                type="submit"
                className="btn btn--primary btn--full"
                disabled={submitting}
              >
                <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Request'}
              </button>

              <button
                type="button"
                className="btn btn--outline btn--full"
                onClick={() => navigate('/customer/requests')}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </PageContainer>
  )
}

export default NewRequestPage
