import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Eye, FileText, CheckCircle, Sparkles, XCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getServiceRequestById, getStatusHistory, startReview, assignTechnician, closeRequest } from '../../services/serviceRequestService.js'
import {
    getTechnicians
} from "../../services/technicianService";
import { getWorkReportByRequestId } from '../../services/workReportService.js'
import { formatDate, formatStatus } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { LoadingState, ErrorState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function ManagementRequestDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [request, setRequest] = useState(null)
  const [history, setHistory] = useState([])
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  
  const [technicians, setTechnicians] = useState([])
  const [selectedTechId, setSelectedTechId] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  async function load() {
    try {
      setIsLoading(true)
      setIsError(false)
      const reqData = await getServiceRequestById(id)
      if (!reqData) { setIsError(true); return }
      setRequest(reqData)

      const [histData, reportData] = await Promise.all([
        getStatusHistory(id).catch(() => []),
        getWorkReportByRequestId(id).catch(() => null)
      ])
      setHistory(histData || [])
      setReport(reportData || null)
    } catch (err) {
      console.error("Failed to load request details:", err)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleStartReview() {
    await startReview(request.id, user.id)
    load()
  }

async function openAssignModal() {
    const techs = await getTechnicians()

    // Only show active technicians
    const available = techs.filter(t => t.isActive)

    setTechnicians(available)
    setSelectedTechId(null)
    setShowAssignModal(true)
}

  async function handleAssign() {
    if (!selectedTechId) return
    const tech = technicians.find(t => t.id === selectedTechId)
    await assignTechnician(request.id, tech.id, tech.fullName, user.id)
    setShowAssignModal(false)
    load()
  }

  async function handleCloseRequest() {
    try {
      const closed = await closeRequest(request.id, user.id)
      if (closed) {
        setRequest(closed)
        setShowCloseModal(false)
        setSuccessMsg('Service request successfully closed and archived.')
        setTimeout(() => setSuccessMsg(''), 4000)
        load()
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) return <PageContainer><LoadingState message="Loading request..." /></PageContainer>
  if (isError || !request) return <PageContainer><ErrorState message="Request not found." onRetry={() => navigate('/management/requests')} /></PageContainer>

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

      <button className="btn btn--ghost btn--sm" onClick={() => navigate('/management/requests')} style={{ marginBottom: 8 }}>
        <ArrowLeft size={16} /> Back to Requests
      </button>

      {/* Action alert banner block */}
      {request.status === 'WorkCompleted' && (
        <div style={{ padding: '16px 20px', background: 'var(--color-warning-light)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-lg)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Sparkles size={20} style={{ color: 'var(--color-warning)' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem' }}>Completion Report Submitted</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Awaiting manager validation review before invoice generation.</p>
            </div>
          </div>
          <button className="btn btn--primary btn--sm" onClick={() => navigate(`/management/requests/${request.id}/report`)}>
            <Eye size={14} style={{ marginRight: 6 }} /> Review Report
          </button>
        </div>
      )}

      {request.status === 'Completed' && report?.reviewStatus === 'Approved' && (
        <div style={{ padding: '16px 20px', background: 'var(--color-success-light)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-lg)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-success)' }}>Work Approved</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Invoice has not been generated for this request yet.</p>
            </div>
          </div>
          <button className="btn btn--primary btn--sm" onClick={() => navigate(`/management/invoices/create?requestId=${request.id}`)}>
            <FileText size={14} style={{ marginRight: 6 }} /> Generate Invoice
          </button>
        </div>
      )}

      {request.status === 'Paid' && (
        <div style={{ padding: '16px 20px', background: 'var(--color-success-light)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-lg)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-success)' }}>Payment Confirmed</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>This request is paid and ready to be closed.</p>
            </div>
          </div>
          <button className="btn btn--danger btn--sm" onClick={() => setShowCloseModal(true)}>
            Close Request
          </button>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">{request.requestNumber} — {request.serviceName}</h1>
          <p className="page-header__subtitle">Customer: {request.customerName} · Created {formatDate(request.createdAt)}</p>
        </div>
        <div className="page-header__actions" style={{ display: 'flex', gap: 8 }}>
          <StatusBadge status={request.status} />
          {request.status === 'Pending' && (
            <button className="btn btn--primary btn--sm" onClick={handleStartReview}>Start Review</button>
          )}
          {['Pending', 'UnderReview'].includes(request.status) && (
            <button className="btn btn--success btn--sm" onClick={openAssignModal}>
              <UserPlus size={14} /> Assign Technician
            </button>
          )}
        </div>
      </div>

      {/* Request Info */}
      <div className="detail-section">
        <div className="detail-section__header"><h3 className="detail-section__title">Request Information</h3></div>
        <div className="detail-section__body">
          <div className="detail-grid">
            <div><p className="detail-item__label">Service</p><p className="detail-item__value">{request.serviceName}</p></div>
            <div><p className="detail-item__label">Customer</p><p className="detail-item__value">{request.customerName}</p></div>
            <div><p className="detail-item__label">Preferred Date</p><p className="detail-item__value">{formatDate(request.preferredDate)}</p></div>
            <div><p className="detail-item__label">Preferred Time</p><p className="detail-item__value">{request.preferredTime}</p></div>
            <div><p className="detail-item__label">Address</p><p className="detail-item__value">{request.addressShortText}</p></div>
            <div><p className="detail-item__label">Technician</p><p className="detail-item__value">{request.assignedTechnicianName || 'Unassigned'}</p></div>
            {request.assetName && <div><p className="detail-item__label">Asset</p><p className="detail-item__value">{request.assetName}</p></div>}
          </div>
        </div>
      </div>

      {/* Problem */}
      <div className="detail-section">
        <div className="detail-section__header"><h3 className="detail-section__title">Problem Description</h3></div>
        <div className="detail-section__body">
          {request.problemTitle && <h4 style={{ fontWeight: 600, marginBottom: 6 }}>{request.problemTitle}</h4>}
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{request.problemDescription}</p>
        </div>
      </div>

      {/* Timeline */}
      {history.length > 0 && (
        <div className="detail-section">
          <div className="detail-section__header"><h3 className="detail-section__title">Status Timeline</h3></div>
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

      {/* Assign Technician Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Technician">
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>Select a technician to assign to this request:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {technicians.map(tech => (
            <div
              key={tech.id}
              onClick={() => setSelectedTechId(tech.id)}
              className={`data-card ${selectedTechId === tech.id ? 'data-card--selected' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="data-card__body" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{tech.fullName}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{tech.specialization} · ⭐ {tech.rating}</p>
                </div>
                <span className={`badge badge--completed`}>{tech.status || 'Available'}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="form-actions">
          <button className="btn btn--outline" onClick={() => setShowAssignModal(false)}>Cancel</button>
          <button className="btn btn--primary" onClick={handleAssign} disabled={!selectedTechId}>Assign</button>
        </div>
      </Modal>

      {/* Close Service Request Dialog */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Close Service Request?"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', color: 'var(--color-danger)' }}>
            <XCircle size={24} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
              This will mark the service request as closed and preserve it in service history. This action is final.
            </p>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => setShowCloseModal(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn--danger" onClick={handleCloseRequest}>
              Close Request
            </button>
          </div>
        </div>
      </Modal>

    </PageContainer>
  )
}

export default ManagementRequestDetailsPage
