import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FileText, Search, AlertCircle, Sparkles, Plus, Trash2, ArrowLeft, Check, Printer } from 'lucide-react'
import { getServiceRequestById, getAllServiceRequests, markAsInvoiced } from '../../services/serviceRequestService.js'
import { getWorkReportByRequestId } from '../../services/workReportService.js'
import { createInvoice, getAllInvoices } from '../../services/invoiceService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { calculateInvoiceBreakdown } from '../../utils/invoiceCalculations.js'
import { formatDate, formatCurrency } from '../../utils/format.js'
import { LoadingState, ErrorState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function GenerateInvoicePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  
  const requestIdParam = searchParams.get('requestId')

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [step, setStep] = useState(1) // 1: Select request, 2: Form, 3: Preview
  const [duplicateInvoiceId, setDuplicateInvoiceId] = useState(null)

  // Selector list state
  const [eligibleRequests, setEligibleRequests] = useState([])
  const [selectorSearch, setSelectorSearch] = useState('')
  const [selectorFilter, setSelectorFilter] = useState('All')

  // Selected request & report data
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)

  // Invoice Form State
  const [form, setForm] = useState({
    serviceCharge: 500,
    labourDescription: '',
    labourHours: 1,
    labourCharge: 0,
    parts: [],
    additionalCharges: [], // { description, amount }
    discountType: 'None',
    discountValue: 0,
    taxPercentage: 18,
    warrantyIncluded: 'No',
    warrantyDays: 30,
    warrantyNotes: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Thank you for choosing Field Service.'
  })

  // Additional charge fields
  const [newChargeDesc, setNewChargeDesc] = useState('')
  const [newChargeAmount, setNewChargeAmount] = useState('')

  useEffect(() => {
    async function init() {
      setIsLoading(true)
      
      // Load all requests and invoices to find eligible completed orders
      const [allReqs, allInvs] = await Promise.all([
        getAllServiceRequests(),
        getAllInvoices()
      ])

      // Find requests that are Completed and report is approved
      const eligibleList = []
      for (const r of allReqs) {
        if (r.status === 'Completed' || r.status === 'WorkCompleted') {
          // Check if report is approved
          const report = await getWorkReportByRequestId(r.id)
          if (report && report.reviewStatus === 'Approved') {
            // Check if already invoiced
            const alreadyInvoiced = allInvs.find(i => i.serviceRequestId === r.id)
            if (!alreadyInvoiced) {
              eligibleList.push({ request: r, report })
            }
          }
        }
      }
      setEligibleRequests(eligibleList)

      // If requestId is passed in query, load it automatically
      if (requestIdParam) {
        const reqId = Number(requestIdParam)
        
        // Check for duplicate invoice first
        const existingInvoice = allInvs.find(i => i.serviceRequestId === reqId)
        if (existingInvoice) {
          setDuplicateInvoiceId(existingInvoice.id)
          setIsLoading(false)
          return
        }

        const reqData = await getServiceRequestById(reqId)
        const reportData = await getWorkReportByRequestId(reqId)
        if (reqData && reportData && reportData.reviewStatus === 'Approved') {
          setSelectedRequest(reqData)
          setSelectedReport(reportData)
          initializeForm(reqData, reportData)
          setStep(2)
        } else {
          setIsError(true)
        }
      }
      setIsLoading(false)
    }
    init()
  }, [requestIdParam])

  const initializeForm = (req, rpt) => {
    // Determine default service charge based on request or standard ₹500
    const defaultServiceCharge = 500
    
    // Map report parts list
    const partsList = (rpt.partsUsed || []).map((p, idx) => ({
      id: idx + 1,
      partName: p.name || p.partName,
      quantity: Number(p.quantity || 0),
      unitPrice: Number(p.unitPrice || p.suggestedUnitPrice || 0)
    }))

    setForm({
      serviceCharge: defaultServiceCharge,
      labourDescription: rpt.labourDescription || `${req.serviceName} labour operations`,
      labourHours: rpt.labourHours || 1.5,
      labourCharge: rpt.suggestedLabourCharge || 800,
      parts: partsList,
      additionalCharges: [],
      discountType: 'None',
      discountValue: 0,
      taxPercentage: 18,
      warrantyIncluded: rpt.warrantyRecommended ? 'Yes' : 'No',
      warrantyDays: rpt.recommendedWarrantyDays || 30,
      warrantyNotes: rpt.warrantyRecommended 
        ? `${rpt.recommendedWarrantyDays}-day warranty on replaced parts and labour.` 
        : '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Thank you for choosing Field Service.'
    })
  }

  const handleSelectRequest = (req, rpt) => {
    setSelectedRequest(req)
    setSelectedReport(rpt)
    initializeForm(req, rpt)
    setStep(2)
  }

  // Handle simple input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Edit quantity/price of parts
  const handlePartChange = (partId, field, val) => {
    setForm(prev => ({
      ...prev,
      parts: prev.parts.map(p => 
        p.id === partId ? { ...p, [field]: Number(val) } : p
      )
    }))
  }

  // Add additional charges
  const addAdditionalCharge = () => {
    if (!newChargeDesc.trim() || !newChargeAmount) return
    setForm(prev => ({
      ...prev,
      additionalCharges: [
        ...prev.additionalCharges,
        { id: Date.now(), description: newChargeDesc.trim(), amount: Number(newChargeAmount) }
      ]
    }))
    setNewChargeDesc('')
    setNewChargeAmount('')
  }

  // Remove additional charges
  const removeAdditionalCharge = (id) => {
    setForm(prev => ({
      ...prev,
      additionalCharges: prev.additionalCharges.filter(c => c.id !== id)
    }))
  }

  // Calculations breakdown
  const totals = calculateInvoiceBreakdown({
    serviceCharge: form.serviceCharge,
    labourCharge: form.labourCharge,
    parts: form.parts,
    additionalCharges: form.additionalCharges,
    discountType: form.discountType,
    discountValue: form.discountValue,
    taxPercentage: form.taxPercentage
  })

  const handleSaveInvoice = async (invoiceStatus) => {
    try {
      // 1. Save invoice in invoiceService
      const invoicePayload = {
        serviceRequestId: selectedRequest.id,
        requestNumber: selectedRequest.requestNumber,
        customerId: selectedRequest.customerId,
        customerName: selectedRequest.customerName,
        serviceName: selectedRequest.serviceName,
        serviceAmount: totals.subtotal, // base charges sum
        partsAmount: totals.partsTotal,
        taxAmount: totals.taxAmount,
        totalAmount: totals.grandTotal,
        status: invoiceStatus === 'Draft' ? 'Draft' : 'Pending', // pending payment
        serviceCharge: form.serviceCharge,
        labourCharge: form.labourCharge,
        parts: form.parts,
        additionalCharges: form.additionalCharges,
        discountType: form.discountType,
        discountValue: form.discountValue,
        discountAmount: totals.discountAmount,
        taxPercentage: form.taxPercentage,
        warrantyDays: form.warrantyIncluded === 'Yes' ? form.warrantyDays : 0,
        warrantyNotes: form.warrantyIncluded === 'Yes' ? form.warrantyNotes : '',
        notes: form.notes
      }

      const invoice = await createInvoice(invoicePayload)

      // 2. Advance request status to Invoiced in serviceRequestService
      await markAsInvoiced(selectedRequest.id, invoice.invoiceNumber, user.id)

      navigate('/management/invoices')
    } catch (err) {
      console.error(err)
    }
  }

  // Filter selector completed requests
  const filteredRequests = eligibleRequests.filter(item => {
    const matchesSearch = 
      item.request.requestNumber.toLowerCase().includes(selectorSearch.toLowerCase()) ||
      item.request.customerName.toLowerCase().includes(selectorSearch.toLowerCase()) ||
      item.request.serviceName.toLowerCase().includes(selectorSearch.toLowerCase())

    // Selector Date Filters
    let matchesDate = true
    const completedDate = new Date(item.report.submittedAt)
    const today = new Date()
    const diffTime = Math.abs(today - completedDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (selectorFilter === 'Today') {
      matchesDate = diffDays <= 1
    } else if (selectorFilter === 'Week') {
      matchesDate = diffDays <= 7
    } else if (selectorFilter === 'Month') {
      matchesDate = diffDays <= 30
    }

    return matchesSearch && matchesDate
  })

  if (isLoading) return <PageContainer><LoadingState message="Loading billing data..." /></PageContainer>
  
  if (duplicateInvoiceId) {
    return (
      <PageContainer>
        <div style={{ padding: 32, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-danger)', marginBottom: 16 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>Invoice Already Generated</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
            An invoice has already been created for this service request. Duplicate invoices are not allowed.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn--outline" onClick={() => navigate('/management/completed-work')}>
              Go Back
            </button>
            <button className="btn btn--primary" onClick={() => navigate(`/management/invoices/${duplicateInvoiceId}`)}>
              View Invoice
            </button>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (isError) return <PageContainer><ErrorState message="Eligible completed service request not found." onRetry={() => navigate('/management/completed-work')} /></PageContainer>

  return (
    <PageContainer>
      {step === 1 && (
        <div>
          <div className="page-header" style={{ marginBottom: 24 }}>
            <div className="page-header__info">
              <h1 className="page-header__title">Generate Invoice</h1>
              <p className="page-header__subtitle">Step 1: Select an eligible completed service order to invoice.</p>
            </div>
          </div>

          <div className="filters-bar" style={{ gap: 12 }}>
            <div className="filters-bar__search">
              <Search size={16} className="filters-bar__search-icon" />
              <input
                className="filters-bar__search-input"
                placeholder="Search by Request ID, customer name, service..."
                value={selectorSearch}
                onChange={e => setSelectorSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              value={selectorFilter}
              onChange={e => setSelectorFilter(e.target.value)}
              style={{ maxWidth: 200 }}
            >
              <option value="All">All Eligible Orders</option>
              <option value="Today">Completed Today</option>
              <option value="Week">Completed This Week</option>
              <option value="Month">Completed This Month</option>
            </select>
          </div>

          {filteredRequests.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <FileText size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: 16 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No completed orders ready for invoicing</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', maxWidth: 450, margin: '0 auto' }}>
                Only requests that are in Completed status, have approved technician reports, and don't have invoices generated will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredRequests.map(({ request: r, report: rpt }) => (
                <div key={r.id} className="data-card">
                  <div className="data-card__body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, padding: 20 }}>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '0.98rem', margin: '0 0 4px 0', color: 'var(--color-primary)' }}>{r.requestNumber} — {r.serviceName}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0 0 4px 0' }}>
                        Customer: <strong>{r.customerName}</strong> · Technician: <strong>{r.assignedTechnicianName}</strong>
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: 0 }}>
                        Completed: {new Date(rpt.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <button 
                      className="btn btn--primary btn--sm"
                      onClick={() => handleSelectRequest(r, rpt)}
                    >
                      Select & Prepare Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedRequest && (
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => setStep(1)} style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back to Selection
          </button>

          <div className="page-header" style={{ marginBottom: 24 }}>
            <div className="page-header__info">
              <h1 className="page-header__title">Generate Invoice: {selectedRequest.requestNumber}</h1>
              <p className="page-header__subtitle">Review labour charges, parts checklists, discounts and taxes.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 24, alignItems: 'start' }} className="form-grid-layout">
            
            {/* Form Fields Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Order Info & Customer Info */}
              <div className="detail-section">
                <div className="detail-section__header">
                  <h3 className="detail-section__title">Order & Customer Information</h3>
                </div>
                <div className="detail-section__body">
                  <div className="detail-grid">
                    <div>
                      <p className="detail-item__label">Request ID</p>
                      <p className="detail-item__value" style={{ fontWeight: 600 }}>{selectedRequest.requestNumber}</p>
                    </div>
                    <div>
                      <p className="detail-item__label">Service</p>
                      <p className="detail-item__value">{selectedRequest.serviceName}</p>
                    </div>
                    <div>
                      <p className="detail-item__label">Technician</p>
                      <p className="detail-item__value">{selectedRequest.assignedTechnicianName}</p>
                    </div>
                    <div>
                      <p className="detail-item__label">Customer Name</p>
                      <p className="detail-item__value" style={{ fontWeight: 600 }}>{selectedRequest.customerName}</p>
                    </div>
                    <div>
                      <p className="detail-item__label">Billing Address</p>
                      <p className="detail-item__value">{selectedRequest.addressShortText}</p>
                    </div>
                    <div>
                      <p className="detail-item__label">Email Address</p>
                      <p className="detail-item__value">arjun.mehta@example.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Charge */}
              <div className="detail-section">
                <div className="detail-section__header">
                  <h3 className="detail-section__title">Service Charge</h3>
                </div>
                <div className="detail-section__body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="serviceChargeDesc">Service Description</label>
                      <input 
                        id="serviceChargeDesc"
                        type="text" 
                        className="form-input" 
                        value={`${selectedRequest.serviceName} Base Service Fee`}
                        readOnly 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="serviceChargeAmount">Service Amount (₹)</label>
                      <input 
                        id="serviceChargeAmount"
                        type="number" 
                        className="form-input" 
                        name="serviceCharge"
                        value={form.serviceCharge}
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Labour Charge */}
              <div className="detail-section">
                <div className="detail-section__header">
                  <h3 className="detail-section__title">Labour Charge</h3>
                </div>
                <div className="detail-section__body">
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label" htmlFor="labourDescription">Labour Activity Description</label>
                    <input 
                      id="labourDescription"
                      type="text" 
                      className="form-input" 
                      name="labourDescription"
                      value={form.labourDescription}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="labourHours">Labour Hours (Reported)</label>
                      <input 
                        id="labourHours"
                        type="number" 
                        className="form-input" 
                        name="labourHours"
                        value={form.labourHours}
                        onChange={handleInputChange}
                        step="0.1"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="labourCharge">Final Labour Charge (₹)</label>
                      <input 
                        id="labourCharge"
                        type="number" 
                        className="form-input" 
                        name="labourCharge"
                        value={form.labourCharge}
                        onChange={handleInputChange}
                      />
                      <span className="form-hint">Technician suggested: {formatCurrency(selectedReport.suggestedLabourCharge)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parts Used list */}
              <div className="detail-section">
                <div className="detail-section__header">
                  <h3 className="detail-section__title">Parts Checklist</h3>
                </div>
                <div className="detail-section__body" style={{ padding: 0 }}>
                  {form.parts.length === 0 ? (
                    <p style={{ padding: 20, fontSize: '0.85rem', color: 'var(--color-text-tertiary)', margin: 0 }}>No parts checklist reported on this job.</p>
                  ) : (
                    <div className="data-table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Part Name</th>
                            <th>Quantity</th>
                            <th>Unit Price (₹)</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.parts.map(p => (
                            <tr key={p.id}>
                              <td style={{ fontWeight: 500 }}>{p.partName}</td>
                              <td>{p.quantity}</td>
                              <td>
                                <input
                                  type="number"
                                  className="form-input"
                                  style={{ maxWidth: 100, padding: '4px 8px' }}
                                  value={p.unitPrice}
                                  onChange={e => handlePartChange(p.id, 'unitPrice', e.target.value)}
                                />
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(p.quantity * p.unitPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Charges */}
              <div className="detail-section">
                <div className="detail-section__header">
                  <h3 className="detail-section__title">Additional Miscellaneous Charges</h3>
                </div>
                <div className="detail-section__body">
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }} className="form-row">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Emergency Visit Charge"
                      value={newChargeDesc}
                      onChange={e => setNewChargeDesc(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Amount ₹"
                      value={newChargeAmount}
                      onChange={e => setNewChargeAmount(e.target.value)}
                      style={{ maxWidth: 120 }}
                    />
                    <button
                      type="button"
                      className="btn btn--outline"
                      onClick={addAdditionalCharge}
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>

                  {form.additionalCharges.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {form.additionalCharges.map(c => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                          <span style={{ fontSize: '0.85rem' }}>{c.description}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{formatCurrency(c.amount)}</span>
                            <button
                              type="button"
                              onClick={() => removeAdditionalCharge(c.id)}
                              style={{ color: 'var(--color-danger)', border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Discount & Tax */}
              <div className="detail-section">
                <div className="detail-section__header">
                  <h3 className="detail-section__title">Discounts & Taxes</h3>
                </div>
                <div className="detail-section__body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="discountType">Discount Type</label>
                      <select
                        id="discountType"
                        className="form-select"
                        name="discountType"
                        value={form.discountType}
                        onChange={handleInputChange}
                      >
                        <option value="None">None</option>
                        <option value="Fixed">Fixed Amount (₹)</option>
                        <option value="Percentage">Percentage (%)</option>
                      </select>
                    </div>
                    {form.discountType !== 'None' && (
                      <div className="form-group">
                        <label className="form-label" htmlFor="discountValue">Discount Value</label>
                        <input
                          id="discountValue"
                          type="number"
                          className="form-input"
                          name="discountValue"
                          value={form.discountValue}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                  </div>
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label className="form-label" htmlFor="taxPercentage">Tax Percentage (%)</label>
                    <input
                      id="taxPercentage"
                      type="number"
                      className="form-input"
                      name="taxPercentage"
                      value={form.taxPercentage}
                      onChange={handleInputChange}
                      style={{ maxWidth: 150 }}
                    />
                  </div>
                </div>
              </div>

              {/* Warranty Details */}
              <div className="detail-section">
                <div className="detail-section__header">
                  <h3 className="detail-section__title">Warranty Terms</h3>
                </div>
                <div className="detail-section__body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="warrantyIncluded">Warranty Included?</label>
                      <select
                        id="warrantyIncluded"
                        className="form-select"
                        name="warrantyIncluded"
                        value={form.warrantyIncluded}
                        onChange={handleInputChange}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    {form.warrantyIncluded === 'Yes' && (
                      <div className="form-group">
                        <label className="form-label" htmlFor="warrantyDays">Warranty Period (Days)</label>
                        <input
                          id="warrantyDays"
                          type="number"
                          className="form-input"
                          name="warrantyDays"
                          value={form.warrantyDays}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                  </div>
                  {form.warrantyIncluded === 'Yes' && (
                    <div className="form-group" style={{ marginTop: 12 }}>
                      <label className="form-label" htmlFor="warrantyNotes">Warranty Notes / Limitations</label>
                      <textarea
                        id="warrantyNotes"
                        className="form-textarea"
                        name="warrantyNotes"
                        value={form.warrantyNotes}
                        onChange={handleInputChange}
                        placeholder="e.g. 30-day warranty covers capacitor part and related service labor."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Terms, Notes & Dates */}
              <div className="detail-section">
                <div className="detail-section__header">
                  <h3 className="detail-section__title">Payment Terms & Due Dates</h3>
                </div>
                <div className="detail-section__body">
                  <div className="form-group">
                    <label className="form-label" htmlFor="dueDate">Due Date</label>
                    <input
                      id="dueDate"
                      type="date"
                      className="form-input"
                      name="dueDate"
                      value={form.dueDate}
                      onChange={handleInputChange}
                      style={{ maxWidth: 200 }}
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label className="form-label" htmlFor="notes">Invoice Notes / Legal Memo</label>
                    <textarea
                      id="notes"
                      className="form-textarea"
                      name="notes"
                      value={form.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Live calculations sidebar */}
            <div style={{ position: 'sticky', top: 20 }} className="summary-sticky-sidebar">
              <div style={{ background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--color-border-light)', paddingBottom: 8 }}>
                  Live Invoice Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Service Base Charge</span>
                    <span>{formatCurrency(form.serviceCharge)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Labour Charge</span>
                    <span>{formatCurrency(form.labourCharge)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Parts Checklist</span>
                    <span>{formatCurrency(totals.partsTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Misc. Additional</span>
                    <span>{formatCurrency(totals.additionalTotal)}</span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '8px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>Subtotal</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
                      <span>Discount ({form.discountType === 'Percentage' ? `${form.discountValue}%` : 'Fixed'})</span>
                      <span>- {formatCurrency(totals.discountAmount)}</span>
                    </div>
                  )}

                  <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '8px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Taxable Base Amount</span>
                    <span>{formatCurrency(totals.taxableAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>GST Tax ({form.taxPercentage}%)</span>
                    <span>{formatCurrency(totals.taxAmount)}</span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '2px solid var(--color-border)', margin: '8px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    <span>Grand Total</span>
                    <span>{formatCurrency(totals.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, padding: '16px 0', borderTop: '1px solid var(--color-border)' }}>
            <button className="btn btn--outline" onClick={() => setStep(1)}>
              Cancel
            </button>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn--outline" onClick={() => handleSaveInvoice('Draft')}>
                Save as Draft
              </button>
              <button className="btn btn--outline" onClick={() => setStep(3)}>
                Preview Invoice
              </button>
              <button className="btn btn--primary" onClick={() => handleSaveInvoice('Sent')}>
                Generate & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && selectedRequest && (
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => setStep(2)} style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back to Editor
          </button>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 32, maxWidth: 800, margin: '0 auto' }}>
            
            {/* Preview Sheet */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-border)', paddingBottom: 20, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>FIELD SERVICE</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>Quality Repair and Maintenance Operations</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>INVOICE</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Number: <strong>INV-2026-TBD</strong></p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, fontSize: '0.88rem', marginBottom: 24 }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--color-text-tertiary)', margin: '0 0 4px 0', textTransform: 'uppercase', fontSize: '0.75rem' }}>Bill To</p>
                <p style={{ fontWeight: 700, margin: '0 0 2px 0' }}>{selectedRequest.customerName}</p>
                <p style={{ margin: '0 0 2px 0', color: 'var(--color-text-secondary)' }}>arjun.mehta@example.com</p>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{selectedRequest.addressShortText}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, color: 'var(--color-text-tertiary)', margin: '0 0 4px 0', textTransform: 'uppercase', fontSize: '0.75rem' }}>Details</p>
                <p style={{ margin: '0 0 2px 0' }}>Request: <strong>{selectedRequest.requestNumber}</strong></p>
                <p style={{ margin: '0 0 2px 0' }}>Service: {selectedRequest.serviceName}</p>
                <p style={{ margin: '0 0 2px 0' }}>Technician: {selectedRequest.assignedTechnicianName}</p>
                <p style={{ margin: 0 }}>Due Date: <strong>{formatDate(form.dueDate)}</strong></p>
              </div>
            </div>

            {/* Charges preview table */}
            <div className="data-table-wrap" style={{ marginBottom: 24 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{selectedRequest.serviceName} Base Service Fee</td>
                    <td>1</td>
                    <td>{formatCurrency(form.serviceCharge)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(form.serviceCharge)}</td>
                  </tr>
                  <tr>
                    <td>{form.labourDescription}</td>
                    <td>{form.labourHours} hrs</td>
                    <td>{formatCurrency(form.labourCharge / (form.labourHours || 1))}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(form.labourCharge)}</td>
                  </tr>
                  {form.parts.map(p => (
                    <tr key={p.id}>
                      <td>{p.partName}</td>
                      <td>{p.quantity}</td>
                      <td>{formatCurrency(p.unitPrice)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(p.quantity * p.unitPrice)}</td>
                    </tr>
                  ))}
                  {form.additionalCharges.map(c => (
                    <tr key={c.id}>
                      <td>{c.description}</td>
                      <td>1</td>
                      <td>{formatCurrency(c.amount)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(c.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.88rem', marginBottom: 24 }}>
              <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
                    <span>Discount:</span>
                    <span>- {formatCurrency(totals.discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Taxable Base:</span>
                  <span>{formatCurrency(totals.taxableAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>GST Tax ({form.taxPercentage}%):</span>
                  <span>{formatCurrency(totals.taxAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, borderTop: '2px solid var(--color-border)', paddingTop: 8, color: 'var(--color-primary)' }}>
                  <span>Grand Total:</span>
                  <span>{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>

            {form.warrantyIncluded === 'Yes' && (
              <div style={{ background: 'var(--color-surface-secondary)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', marginBottom: 20, fontSize: '0.82rem' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: 'var(--color-primary)' }}>Warranty Information</p>
                <p style={{ margin: 0 }}>Period: <strong>{form.warrantyDays} Days</strong>. Notes: {form.warrantyNotes}</p>
              </div>
            )}

            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-tertiary)', borderTop: '1px solid var(--color-border-light)', paddingTop: 12 }}>
              <p style={{ margin: '0 0 4px 0' }}>Notes: {form.notes}</p>
              <p style={{ margin: 0 }}>Payment terms: Due within 7 days of invoice issue date.</p>
            </div>

          </div>

          {/* Preview Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, maxWidth: 800, margin: '24px auto 0 auto' }}>
            <button className="btn btn--outline" onClick={() => setStep(2)}>
              Back to Edit
            </button>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn--ghost" onClick={() => window.print()}>
                <Printer size={16} style={{ marginRight: 6 }} /> Print Preview
              </button>
              <button className="btn btn--primary" onClick={() => handleSaveInvoice('Sent')}>
                Generate & Send Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default GenerateInvoicePage
