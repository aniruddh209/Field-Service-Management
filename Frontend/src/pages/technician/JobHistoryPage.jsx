import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Search, Calendar, MapPin, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getTechnicianByUserId } from '../../services/technicianService.js'
import { getRequestsByTechnician } from '../../services/serviceRequestService.js'
import { formatDate } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function JobHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      setIsLoading(true)
      const tech = await getTechnicianByUserId(user.id)
      if (tech) {
        const data = await getRequestsByTechnician(tech.id)
        // Filter only completed/inactive/closed statuses
        const completedJobs = data.filter(j => ['Completed', 'Invoiced', 'PaymentDone', 'Closed', 'Cancelled'].includes(j.status))
        setJobs(completedJobs)
      }
      setIsLoading(false)
    }
    load()
  }, [user])

  const filtered = jobs.filter(job =>
    job.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
    job.customerName.toLowerCase().includes(search.toLowerCase()) ||
    job.serviceName.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <PageContainer><LoadingState message="Loading job history..." /></PageContainer>

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">Job History</h1>
          <p className="page-header__subtitle">Review your past completed jobs</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-bar__search">
          <Search size={16} className="filters-bar__search-icon" />
          <input
            className="filters-bar__search-input"
            placeholder="Search by job #, customer, service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No past jobs" message="You haven't completed any jobs yet." />
      ) : (
        <div className="cards-grid">
          {filtered.map(job => (
            <div key={job.id} className="data-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/technician/jobs/${job.id}`)}>
              <div className="data-card__header">
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                    {job.requestNumber}
                  </span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 2 }}>{job.serviceName}</h3>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <div className="data-card__body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{job.customerName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} />
                    <span>Completed on: {formatDate(job.completedAt || job.preferredDate)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} />
                    <span>{job.addressShortText}</span>
                  </div>
                </div>
              </div>
              <div className="data-card__footer">
                <button className="btn btn--ghost btn--sm">
                  View Summary <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

export default JobHistoryPage
