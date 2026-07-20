import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, AlertTriangle, MessageSquare, Clipboard, FileText } from 'lucide-react'
import { getServiceRequestById, approveWork, returnForCorrection } from '../../services/serviceRequestService.js'
import { getWorkReportByRequestId, approveWorkReport, returnWorkReportForCorrection } from '../../services/workReportService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatDate, formatCurrency } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { LoadingState, ErrorState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function ReviewWorkReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [request, setRequest] = useState(null)
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Dialog state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [correctionReason, setCorrectionReason] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        const reqData = await getServiceRequestById(id)
        if (!reqData) {
          setIsError(true)
          return
        }
        setRequest(reqData)

        const reportData = await getWorkReportByRequestId(reqData.id)
        setReport(reportData)
      } catch (err) {
        console.error(err)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const handleApprove = async () => {
    try {
      // 1. Approve report in workReportService
      await approveWorkReport(request.id)
      // 2. Advance service request status to Completed in serviceRequestService
      const updatedReq = await approveWork(request.id, user.id)
      setRequest(updatedReq)
      
      // Reload report details
      const reportData = await getWorkReportByRequestId(request.id)
      setReport(reportData)

      setSuccessMsg('Work report approved successfully. Invoice can now be generated.')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleReturnSubmit = async (e) => {
    e.preventDefault()
    if (!correctionReason.trim()) return

    try {
      // 1. Mark report as CorrectionRequired in workReportService
      await returnWorkReportForCorrection(request.id, correctionReason.trim())
      // 2. Log status history in serviceRequestService
      await returnForCorrection(request.id, user.id, correctionReason.trim())

      setShowCorrectionModal(false)
      setCorrectionReason('')
      
      // Reload report details
      const reportData = await getWorkReportByRequestId(request.id)
      setReport(reportData)

      setSuccessMsg('Report returned to technician for correction.')
      setTimeout(() => {
        setSuccessMsg('')
        navigate('/management/completed-work')
      }, 3000)
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) return <PageContainer><LoadingState message="Loading work report..." /></PageContainer>
  if (isError || !request) return <PageContainer><ErrorState message="Completed request not found." onRetry={() => navigate('/management/completed-work')} /></PageContainer>

  return (
    <PageContainer>
      {/* Toast Notification */}
      {successMsg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          background: 'var(--color-success)', color: 'white',
          padding: '12px 24px', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--dropdown-shadow)', fontSize: '0.88rem',
          fontWeight: 600, animation: 'fadeIn 0.2s ease'
        }}>
          {successMsg}
        </div>
      )}

      <button className="btn btn--ghost btn--sm" onClick={() => navigate('/management/completed-work')} style={{ marginBottom: 12 }}>
        <ArrowLeft size={16} /> Back to Completed Work
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div className="page-header__info">
          <h1 className="page-header__title">Review Work Report: {request.requestNumber}</h1>
          <p className="page-header__subtitle">Validate diagnosis, charges, and parts list before approving invoicing.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusBadge status={request.status} />
          {report && (
            <span className={`badge ${
              report.reviewStatus === 'Approved' ? 'badge--completed' : 
              report.reviewStatus === 'CorrectionRequired' ? 'badge--cancelled' : 'badge--under-review'
            }`}>
              {report.reviewStatus === 'PendingReview' ? 'Pending Review' : 
               report.reviewStatus === 'CorrectionRequired' ? 'Correction Requested' : 'Approved'}
            </span>
          )}
        </div>
      </div>

      {!report ? (
        <div style={{ padding: 40, textAlign: 'center', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <AlertTriangle size={36} style={{ color: 'var(--color-warning)', marginBottom: 16 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Report Not Found</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
            The technician has not submitted a completion report for this request yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          
          {/* Correction Notice Alert if returned */}
          {report.reviewStatus === 'CorrectionRequired' && (
            <div style={{ padding: '16px 20px', background: 'var(--color-danger-light)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <AlertTriangle size={20} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-danger)', fontSize: '0.9rem' }}>Correction Requested</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Reason: <strong>{report.correctionNotes || 'Needs details clarification.'}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Request Info Summary */}
          <div className="detail-section">
            <div className="detail-section__header">
              <h3 className="detail-section__title">Request Summary</h3>
            </div>
            <div className="detail-section__body">
              <div className="detail-grid">
                <div>
                  <p className="detail-item__label">Request Number</p>
                  <p className="detail-item__value" style={{ fontWeight: 600 }}>{request.requestNumber}</p>
                </div>
                <div>
                  <p className="detail-item__label">Customer Name</p>
                  <p className="detail-item__value">{request.customerName}</p>
                </div>
                <div>
                  <p className="detail-item__label">Service Requested</p>
                  <p className="detail-item__value">{request.serviceName}</p>
                </div>
                <div>
                  <p className="detail-item__label">Service Address</p>
                  <p className="detail-item__value">{request.addressShortText}</p>
                </div>
                <div>
                  <p className="detail-item__label">Technician Assigned</p>
                  <p className="detail-item__value">{request.assignedTechnicianName}</p>
                </div>
                <div>
                  <p className="detail-item__label">Preferred Work Date</p>
                  <p className="detail-item__value">{formatDate(request.preferredDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technician Completion Report */}
          <div className="detail-section">
            <div className="detail-section__header">
              <h3 className="detail-section__title">Technician Completion Report Details</h3>
            </div>
            <div className="detail-section__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: '0 0 4px 0' }}>Diagnosis *</p>
                  <p style={{ fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>{report.diagnosis}</p>
                </div>
                
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: '0 0 4px 0' }}>Work Performed *</p>
                  <p style={{ fontSize: '0.88rem', margin: 0 }}>{report.workPerformed}</p>
                </div>

                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: '0 0 4px 0' }}>Final Resolution *</p>
                  <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--color-success)', fontWeight: 500 }}>{report.resolution}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, background: 'var(--color-surface-secondary)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0 0 2px 0' }}>Labour Hours</p>
                    <p style={{ fontSize: '0.88rem', margin: 0, fontWeight: 600 }}>{report.labourHours || 0} Hours</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0 0 2px 0' }}>Suggested Labour Charge</p>
                    <p style={{ fontSize: '0.88rem', margin: 0, fontWeight: 600, color: 'var(--color-primary)' }}>{formatCurrency(report.suggestedLabourCharge || 0)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0 0 2px 0' }}>Warranty Recommendation</p>
                    <p style={{ fontSize: '0.88rem', margin: 0, fontWeight: 600 }}>
                      {report.warrantyRecommended ? `Recommended (${report.recommendedWarrantyDays || 30} days)` : 'No warranty'}
                    </p>
                  </div>
                </div>

                {report.technicianNotes && (
                  <div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: '0 0 4px 0' }}>Internal Technician Notes</p>
                    <p style={{ fontSize: '0.85rem', margin: 0, fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>"{report.technicianNotes}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Parts Used Summary */}
          <div className="detail-section">
            <div className="detail-section__header">
              <h3 className="detail-section__title">Parts & Inventory Checklist</h3>
            </div>
            <div className="detail-section__body" style={{ padding: 0 }}>
              {!report.partsUsed || report.partsUsed.length === 0 ? (
                <p style={{ padding: 20, fontSize: '0.85rem', color: 'var(--color-text-tertiary)', margin: 0 }}>No inventory parts used on this job.</p>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Part Description</th>
                        <th>Qty Used</th>
                        <th>Unit</th>
                        <th style={{ textAlign: 'right' }}>Suggested Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.partsUsed.map((p, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 500 }}>{p.name || p.partName}</td>
                          <td>{p.quantity}</td>
                          <td>{p.unit || 'Piece'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(p.unitPrice || p.suggestedUnitPrice || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Actions panel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 12 }}>
            <button 
              className="btn btn--outline" 
              onClick={() => navigate('/management/completed-work')}
            >
              Back to list
            </button>

            {report.reviewStatus === 'PendingReview' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  className="btn btn--danger btn--outline" 
                  onClick={() => setShowCorrectionModal(true)}
                >
                  <MessageSquare size={16} style={{ marginRight: 6 }} /> Return for Correction
                </button>
                <button 
                  className="btn btn--success" 
                  onClick={handleApprove}
                >
                  <Check size={16} style={{ marginRight: 6 }} /> Approve Work Report
                </button>
              </div>
            )}

            {report.reviewStatus === 'Approved' && !['Invoiced', 'Paid', 'Closed'].includes(request.status) && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-success)', fontWeight: 600, margin: 0 }}>
                  Report Approved. Invoicing is unlocked.
                </p>
                <button 
                  className="btn btn--primary" 
                  onClick={() => navigate(`/management/invoices/create?requestId=${request.id}`)}
                >
                  <FileText size={16} style={{ marginRight: 6 }} /> Generate Invoice
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Return for Correction Dialog */}
      <Modal 
        isOpen={showCorrectionModal} 
        onClose={() => setShowCorrectionModal(false)} 
        title="Request Report Correction"
        size="sm"
      >
        <form onSubmit={handleReturnSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label form-label--required" htmlFor="correctionReason">Reason for correction</label>
            <textarea
              id="correctionReason"
              className="form-textarea"
              placeholder="e.g. Please clarify AC capacitor brand and upload the after-repair photo showing cooling temperature."
              value={correctionReason}
              onChange={e => setCorrectionReason(e.target.value)}
              required
              rows={4}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => setShowCorrectionModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--danger" disabled={!correctionReason.trim()}>
              Return Report
            </button>
          </div>
        </form>
      </Modal>

    </PageContainer>
  )
}

export default ReviewWorkReportPage
