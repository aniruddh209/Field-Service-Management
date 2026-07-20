import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, User, MapPin, Clock, Phone, FileText, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getServiceRequestById, getStatusHistory } from '../../services/serviceRequestService.js'
import { formatDate, formatStatus, formatCurrency } from '../../utils/format.js'
import { getInvoiceById } from '../../services/invoiceService.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState, ErrorState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function RequestDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [request, setRequest] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        const [reqData, histData] = await Promise.all([
          getServiceRequestById(id),
          getStatusHistory(id)
        ])
        if (!reqData || reqData.customerId !== user?.id) {
          setIsError(true)
          return
        }
        setRequest(reqData)
        setHistory(histData)
      } catch {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id, user?.id])

  if (isLoading) return <PageContainer><LoadingState message="Loading request details..." /></PageContainer>
  if (isError || !request) return <PageContainer><ErrorState message="Request not found or access denied." onRetry={() => navigate('/customer/requests')} /></PageContainer>

  return (
    <PageContainer>
      {/* Back button + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate('/customer/requests')}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header__info">
          <h1 className="page-header__title">{request.requestNumber} — {request.serviceName}</h1>
          <p className="page-header__subtitle">Created {formatDate(request.createdAt)}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Request Info */}
      <div className="detail-section">
        <div className="detail-section__header">
          <h3 className="detail-section__title">Request Information</h3>
        </div>
        <div className="detail-section__body">
          <div className="detail-grid">
            <div>
              <p className="detail-item__label">Service</p>
              <p className="detail-item__value">{request.serviceName}</p>
            </div>
            <div>
              <p className="detail-item__label">Status</p>
              <p className="detail-item__value"><StatusBadge status={request.status} /></p>
            </div>
            <div>
              <p className="detail-item__label">Preferred Date</p>
              <p className="detail-item__value">{formatDate(request.preferredDate)}</p>
            </div>
            <div>
              <p className="detail-item__label">Preferred Time</p>
              <p className="detail-item__value">{request.preferredTime}</p>
            </div>
            <div>
              <p className="detail-item__label">Address</p>
              <p className="detail-item__value">{request.addressShortText}</p>
            </div>
            {request.assetName && (
              <div>
                <p className="detail-item__label">Asset</p>
                <p className="detail-item__value">{request.assetName}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem Details */}
      <div className="detail-section">
        <div className="detail-section__header">
          <h3 className="detail-section__title">Problem Description</h3>
        </div>
        <div className="detail-section__body">
          {request.problemTitle && (
            <h4 style={{ fontWeight: 600, marginBottom: 8 }}>{request.problemTitle}</h4>
          )}
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {request.problemDescription}
          </p>
        </div>
      </div>

      {/* Assigned Technician */}
      {request.assignedTechnicianName && (
        <div className="detail-section">
          <div className="detail-section__header">
            <h3 className="detail-section__title">Assigned Technician</h3>
          </div>
          <div className="detail-section__body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--color-primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem'
              }}>
                {request.assignedTechnicianName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p style={{ fontWeight: 600 }}>{request.assignedTechnicianName}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Field Technician</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      {history.length > 0 && (
        <div className="detail-section">
          <div className="detail-section__header">
            <h3 className="detail-section__title">Status Timeline</h3>
          </div>
          <div className="detail-section__body">
            <div className="timeline">
              {history.map((entry, idx) => {
                const isLast = idx === history.length - 1
                return (
                  <div key={entry.id} className="timeline__item">
                    <div className={`timeline__dot ${isLast ? 'timeline__dot--active' : 'timeline__dot--success'}`}></div>
                    <p className="timeline__status">{formatStatus(entry.status)}</p>
                    <p className="timeline__meta">
                      {new Date(entry.changedAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    {entry.note && <p className="timeline__note">{entry.note}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Link */}
      {['Invoiced', 'PaymentDone', 'Closed'].includes(request.status) && (
        <div className="detail-section">
          <div className="detail-section__body" style={{ textAlign: 'center' }}>
            <button className="btn btn--primary" onClick={() => navigate('/customer/invoices')}>
              <FileText size={16} /> View Invoice
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default RequestDetailsPage
