import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, CheckCircle2, FileText, Plus, Trash2, Save, Wrench, User, MapPin, Calendar, AlertCircle } from 'lucide-react'
import { getServiceRequestById, startServiceRequest, completeServiceRequest } from '../../services/serviceRequestService'
import { getWorkReportByServiceRequestId, createWorkReport, updateWorkReport, addWorkReportPart, removeWorkReportPart } from '../../services/workReportService'
import { getAllInventoryItems } from '../../services/inventoryService'
import { formatDate } from '../../utils/format'
import StatusBadge from '../../components/ui/StatusBadge'
import { LoadingState } from '../../components/ui/PageStates'
import PageContainer from '../../components/layout/PageContainer'

function JobDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [request, setRequest] = useState(null)
  const [workReport, setWorkReport] = useState(null)
  const [inventoryItems, setInventoryItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [diagnosis, setDiagnosis] = useState('')
  const [workPerformed, setWorkPerformed] = useState('')
  const [labourHours, setLabourHours] = useState(1)
  const [suggestedLabourCharge, setSuggestedLabourCharge] = useState(0)
  const [resolution, setResolution] = useState('')
  const [customerSignature, setCustomerSignature] = useState('')
  const [technicianRemarks, setTechnicianRemarks] = useState('')
  const [warrantyDays, setWarrantyDays] = useState(30)

  const [selectedPartId, setSelectedPartId] = useState('')
  const [partQuantity, setPartQuantity] = useState(1)

  const loadJobData = async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const [req, items] = await Promise.all([
        getServiceRequestById(id),
        getAllInventoryItems().catch(() => [])
      ])
      setRequest(req)
      setInventoryItems(items)

      if (req) {
        const report = await getWorkReportByServiceRequestId(id).catch(() => null)
        if (report) {
          setWorkReport(report)
          setDiagnosis(report.diagnosis || '')
          setWorkPerformed(report.workPerformed || '')
          setLabourHours(report.labourHours || 1)
          setSuggestedLabourCharge(report.suggestedLabourCharge || 0)
          setResolution(report.resolution || '')
          setCustomerSignature(report.customerSignature || '')
          setTechnicianRemarks(report.technicianRemarks || '')
          setWarrantyDays(report.warrantyDays || 30)
        }
      }
    } catch (err) {
      setErrorMsg('Failed to load job details.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      loadJobData()
    }
  }, [id])

  const handleStartRequest = async () => {
    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await startServiceRequest(id)
      setSuccessMsg('Job started successfully!')
      await loadJobData()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Unable to start job.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteRequest = async () => {
    if (!workReport) {
      setErrorMsg('Please save a Work Report before marking job as complete.')
      return
    }
    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await completeServiceRequest(id)
      setSuccessMsg('Job completed successfully!')
      await loadJobData()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Unable to complete job.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveWorkReport = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    const dto = {
      serviceRequestId: Number(id),
      diagnosis,
      workPerformed,
      labourHours: Number(labourHours),
      suggestedLabourCharge: Number(suggestedLabourCharge),
      resolution,
      customerSignature,
      technicianRemarks,
      warrantyDays: Number(warrantyDays),
      parts: []
    }

    try {
      if (workReport?.id) {
        await updateWorkReport(workReport.id, dto)
        setSuccessMsg('Work report updated successfully!')
      } else {
        await createWorkReport(dto)
        setSuccessMsg('Work report created successfully!')
      }
      await loadJobData()
    } catch (err) {
      const serverMsg = err.response?.data?.message || 'Failed to save work report.'
      const errors = err.response?.data?.errors
      if (Array.isArray(errors)) {
        setErrorMsg(errors.map(e => e.message).join(' '))
      } else {
        setErrorMsg(serverMsg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddPart = async () => {
    if (!workReport?.id) {
      setErrorMsg('Please save the Work Report first before adding parts.')
      return
    }
    if (!selectedPartId) {
      setErrorMsg('Please select an inventory item.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await addWorkReportPart(workReport.id, {
        inventoryItemId: Number(selectedPartId),
        quantity: Number(partQuantity)
      })
      setSelectedPartId('')
      setPartQuantity(1)
      setSuccessMsg('Part added to work report!')
      await loadJobData()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Unable to add part.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemovePart = async (partId) => {
    if (!workReport?.id) return
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await removeWorkReportPart(workReport.id, partId)
      setSuccessMsg('Part removed!')
      await loadJobData()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Unable to remove part.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <PageContainer><LoadingState message="Loading assignment..." /></PageContainer>

  if (!request) {
    return (
      <PageContainer>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate('/technician/jobs')}>
          <ArrowLeft size={16} /> Back to Assignments
        </button>
        <div style={{ padding: 40, textAlign: 'center' }}>Job not found.</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <button className="btn btn--ghost btn--sm" onClick={() => navigate('/technician/jobs')} style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back to Assignments
      </button>

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#dcfce7', color: '#166534', borderRadius: 'var(--radius-md)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="page-header" style={{ background: 'var(--color-surface)', padding: 20, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 24 }}>
        <div className="page-header__info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-header__title" style={{ fontSize: '1.25rem' }}>
              REQ-{request.id}: {request.service?.serviceName}
            </h1>
            <StatusBadge status={request.status} />
          </div>
          <p className="page-header__subtitle" style={{ marginTop: 6 }}>
            Problem: {request.problemDescription}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {request.status === 'Assigned' && (
            <button className="btn btn--primary" onClick={handleStartRequest} disabled={isSubmitting}>
              <Play size={16} /> Start Job
            </button>
          )}

          {request.status === 'InProgress' && (
            <button className="btn btn--success" onClick={handleCompleteRequest} disabled={isSubmitting}>
              <CheckCircle2 size={16} /> Complete Job
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Customer & Location */}
        <div className="dashboard__card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} /> Customer Details
          </h3>
          <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>{request.customer?.firstName} {request.customer?.lastName}</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Phone: {request.customer?.phoneNumber} | Email: {request.customer?.email}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 12, fontSize: '0.85rem' }}>
            <MapPin size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
            <span>{request.serviceAddress}</span>
          </div>
        </div>

        {/* Date & Asset */}
        <div className="dashboard__card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={16} /> Schedule & Asset
          </h3>
          <p style={{ fontSize: '0.85rem' }}><strong>Preferred Date:</strong> {formatDate(request.preferredDate)}</p>
          {request.asset && (
            <p style={{ fontSize: '0.85rem', marginTop: 8 }}>
              <strong>Asset:</strong> {request.asset.name} ({request.asset.brand} {request.asset.model})
            </p>
          )}
          {request.notes && (
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: 8 }}>
              <strong>Customer Notes:</strong> {request.notes}
            </p>
          )}
        </div>
      </div>

      {/* Work Report Section */}
      <div className="dashboard__card" style={{ padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={20} /> Work Report {workReport ? '(Saved)' : '(Draft)'}
        </h2>

        {workReport && workReport.managerReviewStatus && (
          <div style={{ padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: '0.85rem' }}>
            <strong>Manager Review Status:</strong> <StatusBadge status={workReport.managerReviewStatus} />
            {workReport.correctionReason && (
              <p style={{ color: '#b91c1c', marginTop: 4 }}>
                <strong>Correction Requested:</strong> {workReport.correctionReason}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSaveWorkReport} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div>
              <label className="form-label">Diagnosis</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Initial diagnosis of the problem..."
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Work Performed</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Details of repair or service work performed..."
                value={workPerformed}
                onChange={e => setWorkPerformed(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label className="form-label">Labour Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                className="form-control"
                value={labourHours}
                onChange={e => setLabourHours(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Suggested Labour Charge ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={suggestedLabourCharge}
                onChange={e => setSuggestedLabourCharge(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Warranty (Days)</label>
              <input
                type="number"
                min="0"
                max="3650"
                className="form-control"
                value={warrantyDays}
                onChange={e => setWarrantyDays(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div>
              <label className="form-label">Resolution Summary</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Final resolution statement..."
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Technician Remarks</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Optional internal remarks..."
                value={technicianRemarks}
                onChange={e => setTechnicianRemarks(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Customer Signature / Confirmation</label>
            <input
              type="text"
              className="form-control"
              placeholder="Customer full name or digital signature confirmation..."
              value={customerSignature}
              onChange={e => setCustomerSignature(e.target.value)}
            />
          </div>

          <div>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              <Save size={16} /> {workReport?.id ? 'Update Work Report' : 'Create Work Report'}
            </button>
          </div>
        </form>
      </div>

      {/* Parts Used Section */}
      {workReport && (
        <div className="dashboard__card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wrench size={18} /> Parts Used from Inventory
          </h3>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Select Inventory Part</label>
              <select
                className="form-select"
                value={selectedPartId}
                onChange={e => setSelectedPartId(e.target.value)}
              >
                <option value="">-- Choose Inventory Part --</option>
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku}) - ${item.unitPrice} [Stock: {item.quantityInStock}]
                  </option>
                ))}
              </select>
            </div>

            <div style={{ width: 120 }}>
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={partQuantity}
                onChange={e => setPartQuantity(e.target.value)}
              />
            </div>

            <button className="btn btn--secondary" onClick={handleAddPart} disabled={isSubmitting || !selectedPartId}>
              <Plus size={16} /> Add Part
            </button>
          </div>

          {/* Parts List */}
          {(!workReport.parts || workReport.parts.length === 0) ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
              No inventory parts added to this work report yet.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Part Name</th>
                    <th style={{ padding: '8px 12px' }}>Qty</th>
                    <th style={{ padding: '8px 12px' }}>Unit Price</th>
                    <th style={{ padding: '8px 12px' }}>Total</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workReport.parts.map(part => (
                    <tr key={part.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td style={{ padding: '10px 12px' }}>{part.inventoryItem?.name || `Part #${part.inventoryItemId}`}</td>
                      <td style={{ padding: '10px 12px' }}>{part.quantity}</td>
                      <td style={{ padding: '10px 12px' }}>${part.unitPrice}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>${part.totalPrice}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button className="btn btn--ghost btn--sm" style={{ color: '#dc2626' }} onClick={() => handleRemovePart(part.id)} disabled={isSubmitting}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  )
}

export default JobDetailsPage
