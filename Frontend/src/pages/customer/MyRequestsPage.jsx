import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Calendar, User, MapPin, ChevronRight, Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getMyServiceRequests } from '../../services/serviceRequestService.js'
import { formatDate, formatStatus } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

const STATUS_OPTIONS = ['All', 'Pending', 'UnderReview', 'Assigned', 'Accepted', 'OnTheWay', 'InProgress', 'Completed', 'Invoiced', 'PaymentDone', 'Closed']

function MyRequestsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        const data = await getMyServiceRequests(user.id)
        setRequests(data)
      } catch {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    if (user?.id) load()
  }, [user?.id])

  // Filter logic
  const filtered = requests.filter(r => {
    const matchesSearch = search === '' ||
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      (r.problemTitle || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) return <PageContainer><LoadingState message="Loading your requests..." /></PageContainer>
  if (isError) return <PageContainer><ErrorState onRetry={() => window.location.reload()} /></PageContainer>

  return (
    <PageContainer>
      {/* Header */}
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">My Service Requests</h1>
          <p className="page-header__subtitle">Track and manage all your service requests</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => navigate('/customer/requests/new')}>
            <Plus size={16} /> New Request
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filters-bar__search">
          <Search size={16} className="filters-bar__search-icon" />
          <input
            type="text"
            className="filters-bar__search-input"
            placeholder="Search by request #, service, or problem..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : formatStatus(s)}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No requests found"
          message={search || statusFilter !== 'All' ? 'Try adjusting your filters.' : 'You haven\'t created any service requests yet.'}
          actionLabel="Book a Service"
          onAction={() => navigate('/customer/services')}
        />
      ) : (
        <div className="cards-grid">
          {filtered.map(req => (
            <div key={req.id} className="data-card">
              <div className="data-card__header">
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{req.requestNumber}</span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 2 }}>{req.serviceName}</h3>
                </div>
                <StatusBadge status={req.status} />
              </div>
              <div className="data-card__body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  {req.problemTitle && (
                    <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{req.problemTitle}</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} />
                    <span>{formatDate(req.preferredDate)} · {req.preferredTime}</span>
                  </div>
                  {req.assignedTechnicianName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={13} />
                      <span>Technician: {req.assignedTechnicianName}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} />
                    <span>{req.addressShortText}</span>
                  </div>
                </div>
              </div>
              <div className="data-card__footer">
                <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/customer/requests/${req.id}`)}>
                  View Details <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

export default MyRequestsPage
