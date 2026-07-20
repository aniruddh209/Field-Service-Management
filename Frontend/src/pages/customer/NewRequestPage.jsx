import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, ChevronRight, ChevronLeft, Wrench, MapPin, Package, Calendar, FileText, Send } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getServices } from '../../services/serviceCatalogService.js'
import { getMyAddresses } from '../../services/addressService.js'
import { getMyAssets } from '../../services/assetService.js'
import { createServiceRequest } from '../../services/serviceRequestService.js'
import { formatCurrency } from '../../utils/format.js'
import PageContainer from '../../components/layout/PageContainer.jsx'
import './NewRequestPage.css'

const STEPS = [
  { label: 'Service', icon: Wrench },
  { label: 'Address', icon: MapPin },
  { label: 'Asset', icon: Package },
  { label: 'Schedule', icon: Calendar },
  { label: 'Problem', icon: FileText },
  { label: 'Review', icon: Check },
  { label: 'Submit', icon: Send }
]

function NewRequestPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [services, setServices] = useState([])
  const [addresses, setAddresses] = useState([])
  const [assets, setAssets] = useState([])
  const [form, setForm] = useState({
    serviceId: null, serviceName: '', servicePrice: 0,
    addressId: null, addressShortText: '',
    assetId: null, assetName: '',
    preferredDate: '', preferredTime: '',
    problemTitle: '', problemDescription: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [newRequest, setNewRequest] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    async function load() {
      const [svcData, addrData, assetData] = await Promise.all([
        getServices(), getMyAddresses(user.id), getMyAssets(user.id)
      ])
      setServices(svcData)
      setAddresses(addrData)
      setAssets(assetData)
    }
    if (user?.id) load()
  }, [user?.id])

  function canProceed() {
    switch (step) {
      case 0: return !!form.serviceId
      case 1: return !!form.addressId
      case 2: return true // asset is optional
      case 3: return !!form.preferredDate && !!form.preferredTime
      case 4: return !!form.problemTitle.trim() && !!form.problemDescription.trim()
      case 5: return true // review step
      default: return false
    }
  }

  function handleNext() {
    if (!canProceed()) {
      // Set appropriate errors
      const e = {}
      if (step === 0 && !form.serviceId) e.service = 'Please select a service'
      if (step === 1 && !form.addressId) e.address = 'Please select an address'
      if (step === 3 && !form.preferredDate) e.date = 'Date is required'
      if (step === 3 && !form.preferredTime) e.time = 'Time is required'
      if (step === 4 && !form.problemTitle.trim()) e.problemTitle = 'Problem title is required'
      if (step === 4 && !form.problemDescription.trim()) e.problemDescription = 'Please describe the problem'
      setErrors(e)
      return
    }
    setErrors({})
    if (step === 5) {
      handleSubmit()
    } else {
      setStep(s => s + 1)
    }
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1)
  }

  async function handleSubmit() {
    const data = {
      customerId: user.id,
      customerName: `${user.firstName} ${user.lastName}`,
      serviceId: form.serviceId,
      serviceName: form.serviceName,
      addressId: form.addressId,
      addressShortText: form.addressShortText,
      assetId: form.assetId,
      assetName: form.assetName,
      preferredDate: form.preferredDate,
      preferredTime: form.preferredTime,
      problemTitle: form.problemTitle,
      problemDescription: form.problemDescription
    }
    const result = await createServiceRequest(data)
    setNewRequest(result)
    setSubmitted(true)
    setStep(6)
  }

  function selectService(svc) {
    setForm(f => ({ ...f, serviceId: svc.id, serviceName: svc.name, servicePrice: svc.price || svc.startingPrice || 0 }))
    setErrors({})
  }

  function selectAddress(addr) {
    setForm(f => ({ ...f, addressId: addr.id, addressShortText: `${addr.addressLine1}, ${addr.city}` }))
    setErrors({})
  }

  function selectAsset(asset) {
    setForm(f => ({ ...f, assetId: asset.id, assetName: asset.name }))
  }

  return (
    <PageContainer>
      <button className="btn btn--ghost btn--sm" onClick={() => navigate('/customer/requests')} style={{ marginBottom: 8 }}>
        <ArrowLeft size={16} /> Back to My Requests
      </button>

      <h1 className="page-header__title">New Service Request</h1>

      {/* Step Indicator */}
      <div className="wizard-steps">
        {STEPS.map((s, idx) => {
          const Icon = s.icon
          const isComplete = idx < step
          const isActive = idx === step
          return (
            <div key={s.label} className={`wizard-step ${isComplete ? 'wizard-step--complete' : ''} ${isActive ? 'wizard-step--active' : ''}`}>
              <div className="wizard-step__dot">
                {isComplete ? <Check size={12} /> : <Icon size={12} />}
              </div>
              <span className="wizard-step__label">{s.label}</span>
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="wizard-content">
        {/* Step 0: Select Service */}
        {step === 0 && (
          <div>
            <h2 className="wizard-content__title">Select a Service</h2>
            <p className="wizard-content__subtitle">Choose the type of service you need</p>
            {errors.service && <p className="form-error" style={{ marginBottom: 12 }}>{errors.service}</p>}
            <div className="cards-grid">
              {services.map(svc => (
                <div key={svc.id} className={`data-card ${form.serviceId === svc.id ? 'data-card--selected' : ''}`} onClick={() => selectService(svc)} style={{ cursor: 'pointer' }}>
                  <div className="data-card__header">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{svc.name}</h3>
                    {form.serviceId === svc.id && <Check size={18} style={{ color: 'var(--color-primary)' }} />}
                  </div>
                  <div className="data-card__body">
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>{svc.description}</p>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {svc.startingPrice ? `Starting at ${formatCurrency(svc.startingPrice)}` : formatCurrency(svc.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Select Address */}
        {step === 1 && (
          <div>
            <h2 className="wizard-content__title">Choose Service Address</h2>
            <p className="wizard-content__subtitle">Where should the technician visit?</p>
            {errors.address && <p className="form-error" style={{ marginBottom: 12 }}>{errors.address}</p>}
            {addresses.length === 0 ? (
              <div className="page-state page-state--empty">
                <MapPin size={36} className="page-state__icon" />
                <p className="page-state__title">No addresses saved</p>
                <button className="btn btn--primary" onClick={() => navigate('/customer/addresses')}>Add Address First</button>
              </div>
            ) : (
              <div className="cards-grid">
                {addresses.map(addr => (
                  <div key={addr.id} className={`data-card ${form.addressId === addr.id ? 'data-card--selected' : ''}`} onClick={() => selectAddress(addr)} style={{ cursor: 'pointer' }}>
                    <div className="data-card__header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{addr.label}</h3>
                      </div>
                      {form.addressId === addr.id && <Check size={18} style={{ color: 'var(--color-primary)' }} />}
                    </div>
                    <div className="data-card__body">
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{addr.addressLine1}, {addr.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Asset (Optional) */}
        {step === 2 && (
          <div>
            <h2 className="wizard-content__title">Select Equipment (Optional)</h2>
            <p className="wizard-content__subtitle">If the service is for a specific equipment, select it below</p>
            <div className="cards-grid">
              <div className={`data-card ${form.assetId === null ? 'data-card--selected' : ''}`} onClick={() => setForm(f => ({ ...f, assetId: null, assetName: '' }))} style={{ cursor: 'pointer' }}>
                <div className="data-card__body" style={{ padding: 16, textAlign: 'center' }}>
                  <p style={{ fontWeight: 600 }}>None / Not Applicable</p>
                </div>
              </div>
              {assets.map(asset => (
                <div key={asset.id} className={`data-card ${form.assetId === asset.id ? 'data-card--selected' : ''}`} onClick={() => selectAsset(asset)} style={{ cursor: 'pointer' }}>
                  <div className="data-card__header">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{asset.name}</h3>
                    {form.assetId === asset.id && <Check size={18} style={{ color: 'var(--color-primary)' }} />}
                  </div>
                  <div className="data-card__body">
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{asset.brand} {asset.model && `· ${asset.model}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div>
            <h2 className="wizard-content__title">Preferred Schedule</h2>
            <p className="wizard-content__subtitle">When would you like the technician to visit?</p>
            <div style={{ maxWidth: 400 }}>
              <div className="form-group">
                <label className="form-label form-label--required">Preferred Date</label>
                <input type="date" className={`form-input ${errors.date ? 'form-input--error' : ''}`} value={form.preferredDate} onChange={e => { setForm(f => ({ ...f, preferredDate: e.target.value })); setErrors({}) }} min={new Date().toISOString().split('T')[0]} />
                {errors.date && <span className="form-error">{errors.date}</span>}
              </div>
              <div className="form-group">
                <label className="form-label form-label--required">Preferred Time</label>
                <select className={`form-select ${errors.time ? 'form-select--error' : ''}`} value={form.preferredTime} onChange={e => { setForm(f => ({ ...f, preferredTime: e.target.value })); setErrors({}) }}>
                  <option value="">Select time slot</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="15:30">3:30 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
                {errors.time && <span className="form-error">{errors.time}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Problem Description */}
        {step === 4 && (
          <div>
            <h2 className="wizard-content__title">Describe the Problem</h2>
            <p className="wizard-content__subtitle">Help us understand what you need</p>
            <div style={{ maxWidth: 520 }}>
              <div className="form-group">
                <label className="form-label form-label--required">Problem Title</label>
                <input className={`form-input ${errors.problemTitle ? 'form-input--error' : ''}`} value={form.problemTitle} onChange={e => setForm(f => ({ ...f, problemTitle: e.target.value }))} placeholder="Brief summary, e.g. AC not cooling" />
                {errors.problemTitle && <span className="form-error">{errors.problemTitle}</span>}
              </div>
              <div className="form-group">
                <label className="form-label form-label--required">Detailed Description</label>
                <textarea className={`form-textarea ${errors.problemDescription ? 'form-textarea--error' : ''}`} value={form.problemDescription} onChange={e => setForm(f => ({ ...f, problemDescription: e.target.value }))} placeholder="Describe the issue in detail..." rows={5} />
                {errors.problemDescription && <span className="form-error">{errors.problemDescription}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div>
            <h2 className="wizard-content__title">Review & Submit</h2>
            <p className="wizard-content__subtitle">Please verify your details before submitting</p>
            <div className="detail-section" style={{ marginTop: 16 }}>
              <div className="detail-section__body">
                <div className="detail-grid">
                  <div><p className="detail-item__label">Service</p><p className="detail-item__value">{form.serviceName}</p></div>
                  <div><p className="detail-item__label">Address</p><p className="detail-item__value">{form.addressShortText}</p></div>
                  <div><p className="detail-item__label">Equipment</p><p className="detail-item__value">{form.assetName || 'Not specified'}</p></div>
                  <div><p className="detail-item__label">Preferred Date</p><p className="detail-item__value">{form.preferredDate}</p></div>
                  <div><p className="detail-item__label">Preferred Time</p><p className="detail-item__value">{form.preferredTime}</p></div>
                  <div><p className="detail-item__label">Estimated Price</p><p className="detail-item__value" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{form.servicePrice ? formatCurrency(form.servicePrice) : 'Quote upon inspection'}</p></div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <p className="detail-item__label">Problem</p>
                  <p className="detail-item__value" style={{ fontWeight: 600 }}>{form.problemTitle}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>{form.problemDescription}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Success */}
        {step === 6 && submitted && (
          <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={32} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Request Submitted!</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              Your request <strong>{newRequest?.requestNumber}</strong> has been created successfully.
            </p>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', marginBottom: 24 }}>
              Our team will review it shortly and assign a technician.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn--outline" onClick={() => navigate('/customer/requests')}>View My Requests</button>
              <button className="btn btn--primary" onClick={() => navigate('/customer/dashboard')}>Go to Dashboard</button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {step < 6 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button className="btn btn--outline" onClick={step === 0 ? () => navigate('/customer/requests') : handleBack} disabled={false}>
            <ChevronLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <button className="btn btn--primary" onClick={handleNext} disabled={!canProceed()}>
            {step === 5 ? 'Submit Request' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </PageContainer>
  )
}

export default NewRequestPage
