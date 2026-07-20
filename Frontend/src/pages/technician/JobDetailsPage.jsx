import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Play, MapPin, Calendar, Clock, AlertTriangle, Hammer, Shield, Sparkles, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getServiceRequestById, getStatusHistory, acceptJob, rejectAssignment, startTravel, startWork, completeJob } from '../../services/serviceRequestService.js'
import { getActiveInventoryItems } from '../../services/inventoryService.js'
import { getWorkReportByRequestId, submitWorkReport } from '../../services/workReportService.js'
import { formatDate, formatStatus, formatCurrency } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { LoadingState, ErrorState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function JobDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [job, setJob] = useState(null)
  const [history, setHistory] = useState([])
  const [inventory, setInventory] = useState([])
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Rejection state
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // Completion form state
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [completionForm, setCompletionForm] = useState({
    diagnosis: '',
    workPerformed: '',
    labourDescription: '',
    labourHours: 1.5,
    suggestedLabourCharge: 800,
    partsUsed: [],
    resolution: '',
    technicianNotes: '',
    warrantyRecommended: true,
    recommendedWarrantyDays: 30
  })
  
  const [selectedPartId, setSelectedPartId] = useState('')
  const [selectedPartQty, setSelectedPartQty] = useState(1)

  async function load() {
    try {
      setIsLoading(true)
      const [jobData, histData, partsData, reportData] = await Promise.all([
        getServiceRequestById(id),
        getStatusHistory(id),
        getActiveInventoryItems(),
        getWorkReportByRequestId(id)
      ])
      if (!jobData) {
        setIsError(true)
        return
      }
      setJob(jobData)
      setHistory(histData)
      setInventory(partsData)
      setReport(reportData)

      // Pre-fill completion form if report exists (e.g. resubmitting correction)
      if (reportData) {
        setCompletionForm({
          diagnosis: reportData.diagnosis || '',
          workPerformed: reportData.workPerformed || '',
          labourDescription: reportData.labourDescription || '',
          labourHours: reportData.labourHours || 1.5,
          suggestedLabourCharge: reportData.suggestedLabourCharge || 800,
          partsUsed: reportData.partsUsed || [],
          resolution: reportData.resolution || '',
          technicianNotes: reportData.technicianNotes || '',
          warrantyRecommended: reportData.warrantyRecommended ?? true,
          recommendedWarrantyDays: reportData.recommendedWarrantyDays || 30
        })
      }
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function handleAccept() {
    await acceptJob(job.id, user.id)
    load()
  }

  async function handleRejectSubmit(e) {
    e.preventDefault()
    if (!rejectReason.trim()) return
    await rejectAssignment(job.id, user.id, rejectReason)
    setShowRejectModal(false)
    navigate('/technician/jobs')
  }

  async function handleStartTravel() {
    await startTravel(job.id, user.id)
    load()
  }

  async function handleStartWork() {
    await startWork(job.id, user.id)
    load()
  }

  function addPartToUsed() {
    if (!selectedPartId) return
    const part = inventory.find(p => p.id === Number(selectedPartId))
    if (!part) return

    // Check if already added
    const existing = completionForm.partsUsed.find(p => p.partId === part.id)
    if (existing) {
      setCompletionForm(f => ({
        ...f,
        partsUsed: f.partsUsed.map(p =>
          p.partId === part.id ? { ...p, quantity: p.quantity + Number(selectedPartQty) } : p
        )
      }))
    } else {
      setCompletionForm(f => ({
        ...f,
        partsUsed: [...f.partsUsed, { 
          partId: part.id, 
          name: part.name, 
          unitPrice: part.unitPrice, 
          quantity: Number(selectedPartQty), 
          unit: 'Piece' 
        }]
      }))
    }
    setSelectedPartId('')
    setSelectedPartQty(1)
  }

  function removePartFromUsed(partId) {
    setCompletionForm(f => ({
      ...f,
      partsUsed: f.partsUsed.filter(p => p.partId !== partId)
    }))
  }

  const handleFormInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setCompletionForm(prev => ({ ...prev, [name]: val }))
  }

  async function handleCompleteSubmit(e) {
    e.preventDefault()
    if (!completionForm.diagnosis.trim() || !completionForm.workPerformed.trim() || !completionForm.resolution.trim()) return
    
    // 1. Submit completion report in workReportService
    await submitWorkReport(job.id, completionForm, user.technicianId || 1, `${user.firstName} ${user.lastName}`)
    
    // 2. Complete job status transition in serviceRequestService
    await completeJob(job.id, user.id, completionForm)
    
    setShowCompleteModal(false)
    load()
  }

  if (isLoading) return <PageContainer><LoadingState message="Loading job details..." /></PageContainer>
  if (isError || !job) return <PageContainer><ErrorState message="Job assignment not found." onRetry={() => navigate('/technician/jobs')} /></PageContainer>

  return (
    <PageContainer>
      <button className="btn btn--ghost btn--sm" onClick={() => navigate('/technician/jobs')} style={{ marginBottom: 8 }}>
        <ArrowLeft size={16} /> Back to My Assignments
      </button>

      {/* Header */}
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">{job.requestNumber} — {job.serviceName}</h1>
          <p className="page-header__subtitle">Customer: {job.customerName} · Created {formatDate(job.createdAt)}</p>
        </div>
        <div className="page-header__actions">
          <StatusBadge status={job.status} />
        </div>
      </div>

      {/* Rejection Alert / Correction Requested Alert */}
      {report?.reviewStatus === 'CorrectionRequired' && (
        <div style={{ padding: '16px 20px', background: 'var(--color-danger-light)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-lg)', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertTriangle size={20} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-danger)', fontSize: '0.9rem' }}>Correction Required on Completion Report</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Feedback: <strong>{report.correctionNotes || 'Please adjust the report charges or files.'}</strong>
            </p>
            <button className="btn btn--danger btn--sm" style={{ marginTop: 12 }} onClick={() => setShowCompleteModal(true)}>
              Edit and Resubmit Report
            </button>
          </div>
        </div>
      )}

      {/* Action panel */}
      {['Assigned', 'Accepted', 'OnTheWay', 'InProgress'].includes(job.status) && (
        <div className="detail-section" style={{ background: 'var(--color-primary-alpha)', borderColor: 'var(--color-primary)' }}>
          <div className="detail-section__body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 600 }}>Action Required</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Advance the service status as you perform the work.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {job.status === 'Assigned' && (
                <>
                  <button className="btn btn--danger btn--sm" onClick={() => setShowRejectModal(true)}>Reject</button>
                  <button className="btn btn--primary btn--sm" onClick={handleAccept}>Accept Job</button>
                </>
              )}
              {job.status === 'Accepted' && (
                <button className="btn btn--primary btn--sm" onClick={handleStartTravel}>
                  <Play size={14} /> Start Travel
                </button>
              )}
              {job.status === 'OnTheWay' && (
                <button className="btn btn--primary btn--sm" onClick={handleStartWork}>
                  <Play size={14} /> Start Work
                </button>
              )}
              {job.status === 'InProgress' && (
                <button className="btn btn--success btn--sm" onClick={() => setShowCompleteModal(true)}>
                  <Check size={14} /> Complete Work
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Work completed banner */}
      {job.status === 'WorkCompleted' && report?.reviewStatus !== 'CorrectionRequired' && (
        <div className="detail-section" style={{ background: 'var(--color-surface-secondary)', borderStyle: 'dashed' }}>
          <div className="detail-section__body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Sparkles size={20} style={{ color: 'var(--color-warning)' }} />
            <div>
              <p style={{ fontWeight: 600, margin: 0 }}>Work Completed</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                Your completion report is successfully submitted and is currently awaiting Manager final approval before customer invoicing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Job Info */}
      <div className="detail-section">
        <div className="detail-section__header">
          <h3 className="detail-section__title">Customer & Service Location</h3>
        </div>
        <div className="detail-section__body">
          <div className="detail-grid">
            <div>
              <p className="detail-item__label">Customer Name</p>
              <p className="detail-item__value">{job.customerName}</p>
            </div>
            <div>
              <p className="detail-item__label">Service Requested</p>
              <p className="detail-item__value">{job.serviceName}</p>
            </div>
            <div>
              <p className="detail-item__label">Scheduled Date</p>
              <p className="detail-item__value">{formatDate(job.preferredDate)}</p>
            </div>
            <div>
              <p className="detail-item__label">Scheduled Slot</p>
              <p className="detail-item__value">{job.preferredTime}</p>
            </div>
            <div className="grid-span-2">
              <p className="detail-item__label">Address</p>
              <p className="detail-item__value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} /> {job.addressShortText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Problem details */}
      <div className="detail-section">
        <div className="detail-section__header">
          <h3 className="detail-section__title">Reported Problem</h3>
        </div>
        <div className="detail-section__body">
          {job.problemTitle && <h4 style={{ fontWeight: 600, marginBottom: 6 }}>{job.problemTitle}</h4>}
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{job.problemDescription}</p>
        </div>
      </div>

      {/* Work report summary if submitted */}
      {report && (
        <div className="detail-section">
          <div className="detail-section__header">
            <h3 className="detail-section__title">Technician Completion Report</h3>
          </div>
          <div className="detail-section__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: '0 0 2px 0' }}>Diagnosis</p>
                <p style={{ fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>{report.diagnosis}</p>
              </div>
              
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: '0 0 2px 0' }}>Work Performed</p>
                <p style={{ fontSize: '0.88rem', margin: 0 }}>{report.workPerformed}</p>
              </div>

              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: '0 0 2px 0' }}>Final Resolution</p>
                <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--color-success)', fontWeight: 500 }}>{report.resolution}</p>
              </div>

              <div style={{ display: 'flex', gap: 16, background: 'var(--color-surface-secondary)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0 0 2px 0' }}>Labour Hours</p>
                  <p style={{ fontSize: '0.88rem', margin: 0, fontWeight: 600 }}>{report.labourHours} hrs</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0 0 2px 0' }}>Suggested Labor Charge</p>
                  <p style={{ fontSize: '0.88rem', margin: 0, fontWeight: 600 }}>{formatCurrency(report.suggestedLabourCharge)}</p>
                </div>
              </div>

              {report.partsUsed && report.partsUsed.length > 0 && (
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: '0 0 4px 0' }}>Parts Used</p>
                  <ul style={{ paddingLeft: 20, fontSize: '0.85rem', margin: 0 }}>
                    {report.partsUsed.map((p, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>
                        {p.name} (Qty: {p.quantity} · Unit Suggested Price: {formatCurrency(p.unitPrice)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {history.length > 0 && (
        <div className="detail-section">
          <div className="detail-section__header">
            <h3 className="detail-section__title">Status History</h3>
          </div>
          <div className="detail-section__body">
            <div className="timeline">
              {history.map((entry, idx) => {
                const isLast = idx === history.length - 1
                return (
                  <div key={entry.id} className="timeline__item">
                    <div className={`timeline__dot ${isLast ? 'timeline__dot--active' : 'timeline__dot--success'}`}></div>
                    <p className="timeline__status">{formatStatus(entry.status)}</p>
                    <p className="timeline__meta">{new Date(entry.changedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    {entry.note && <p className="timeline__note">{entry.note}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Job Assignment">
        <form onSubmit={handleRejectSubmit}>
          <div className="form-group">
            <label className="form-label form-label--required" htmlFor="rejectReason">Reason for Rejection</label>
            <textarea
              id="rejectReason"
              className="form-textarea"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Please provide a brief reason..."
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => setShowRejectModal(false)}>Cancel</button>
            <button type="submit" className="btn btn--danger">Submit Rejection</button>
          </div>
        </form>
      </Modal>

      {/* Complete Job Modal */}
      <Modal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)} title="Complete Service Report" size="lg">
        <form onSubmit={handleCompleteSubmit}>
          
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
            A. Diagnosis Details
          </h4>
          <div className="form-group">
            <label className="form-label form-label--required" htmlFor="diagnosisField">Diagnosis</label>
            <input
              id="diagnosisField"
              type="text"
              className="form-input"
              name="diagnosis"
              value={completionForm.diagnosis}
              onChange={handleFormInputChange}
              placeholder="e.g. Blown capacitor on AC compressor due to surge"
              required
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '16px 0' }} />

          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
            B. Work Performed & Labour
          </h4>
          <div className="form-group">
            <label className="form-label form-label--required" htmlFor="workPerformedField">Work Performed Details</label>
            <textarea
              id="workPerformedField"
              className="form-textarea"
              name="workPerformed"
              value={completionForm.workPerformed}
              onChange={handleFormInputChange}
              placeholder="Describe work completed (e.g. Removed faulty capacitor, installed replacement, vacuum cleaned condenser)..."
              rows={3}
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label" htmlFor="labourDescriptionField">Labour Description</label>
            <input
              id="labourDescriptionField"
              type="text"
              className="form-input"
              name="labourDescription"
              value={completionForm.labourDescription}
              onChange={handleFormInputChange}
              placeholder="e.g. AC compressor diagnostics and electrical repair"
            />
          </div>

          <div className="form-row" style={{ marginTop: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="labourHoursField">Labour Hours</label>
              <input
                id="labourHoursField"
                type="number"
                step="0.1"
                className="form-input"
                name="labourHours"
                value={completionForm.labourHours}
                onChange={handleFormInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="suggestedLabourChargeField">Suggested Labour Charge (₹)</label>
              <input
                id="suggestedLabourChargeField"
                type="number"
                className="form-input"
                name="suggestedLabourCharge"
                value={completionForm.suggestedLabourCharge}
                onChange={handleFormInputChange}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '16px 0' }} />

          {/* Parts Used Selection */}
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
            C. Spare Parts Checklist
          </h4>
          <div className="detail-section" style={{ borderStyle: 'dashed' }}>
            <div className="detail-section__body" style={{ padding: 12 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-end' }} className="form-row">
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" htmlFor="selectPartField">Select Spare Part</label>
                  <select
                    id="selectPartField"
                    className="form-select"
                    value={selectedPartId}
                    onChange={e => setSelectedPartId(e.target.value)}
                  >
                    <option value="">-- Choose Spare Part --</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.sku}) · In Stock: {item.quantityInStock} · price: {formatCurrency(item.unitPrice)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ width: 80, marginBottom: 0 }}>
                  <label className="form-label" htmlFor="qtyField">Qty</label>
                  <input
                    id="qtyField"
                    type="number"
                    className="form-input"
                    value={selectedPartQty}
                    onChange={e => setSelectedPartQty(Number(e.target.value))}
                    min={1}
                  />
                </div>
                <button type="button" className="btn btn--outline" onClick={addPartToUsed}>Add</button>
              </div>

              {/* Table of added parts */}
              {completionForm.partsUsed.length > 0 && (
                <div className="data-table-wrap">
                  <table className="data-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Part Name</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {completionForm.partsUsed.map(p => (
                        <tr key={p.partId}>
                          <td>{p.name}</td>
                          <td>{p.quantity}</td>
                          <td>{formatCurrency(p.unitPrice)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              style={{ color: 'var(--color-danger)' }}
                              onClick={() => removePartFromUsed(p.partId)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '16px 0' }} />

          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
            D. Resolution & Warranty Recommendation
          </h4>
          <div className="form-group">
            <label className="form-label form-label--required" htmlFor="resolutionField">Final Resolution Notes</label>
            <input
              id="resolutionField"
              type="text"
              className="form-input"
              name="resolution"
              value={completionForm.resolution}
              onChange={handleFormInputChange}
              placeholder="e.g. Replaced AC capacitor, restored compressor normal cycling."
              required
            />
          </div>

          <div className="form-row" style={{ marginTop: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="warrantyRec">Recommend Warranty?</label>
              <select
                id="warrantyRec"
                className="form-select"
                name="warrantyRecommended"
                value={completionForm.warrantyRecommended ? 'Yes' : 'No'}
                onChange={e => setCompletionForm(prev => ({ ...prev, warrantyRecommended: e.target.value === 'Yes' }))}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {completionForm.warrantyRecommended && (
              <div className="form-group">
                <label className="form-label" htmlFor="warrantyPeriod">Period Days</label>
                <input
                  id="warrantyPeriod"
                  type="number"
                  className="form-input"
                  name="recommendedWarrantyDays"
                  value={completionForm.recommendedWarrantyDays}
                  onChange={handleFormInputChange}
                />
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label" htmlFor="techNotesField">Additional Notes</label>
            <textarea
              id="techNotesField"
              className="form-textarea"
              name="technicianNotes"
              value={completionForm.technicianNotes}
              onChange={handleFormInputChange}
              placeholder="Advice for client, general follow-up points..."
            />
          </div>

          <div className="form-actions" style={{ marginTop: 20 }}>
            <button type="button" className="btn btn--outline" onClick={() => setShowCompleteModal(false)}>Cancel</button>
            <button type="submit" className="btn btn--success" disabled={!completionForm.diagnosis.trim() || !completionForm.workPerformed.trim() || !completionForm.resolution.trim()}>
              Submit Completion Report
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  )
}

export default JobDetailsPage
