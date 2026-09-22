import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Calendar, MapPin, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAssignedServiceRequests } from '../../services/serviceRequestService.js'
import { formatDate } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function JobHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [completedJobs, setCompletedJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      setIsLoading(true)
      try {
        const jobs = await getAssignedServiceRequests()
        const completed = jobs.filter(j => ['Completed', 'Invoiced', 'PaymentDone', 'Closed'].includes(j.status))
        setCompletedJobs(completed)
      } catch (err) {
        console.error("Error loading job history:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user])

  if (isLoading) return <PageContainer><LoadingState message="Loading job history..." /></PageContainer>

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">Job History</h1>
          <p className="page-header__subtitle">Review your past completed service jobs</p>
        </div>
      </div>

      {completedJobs.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No Completed Jobs Yet" message="Completed jobs will appear here after you finish assignments." />
      ) : (
        <div className="cards-grid">
          {completedJobs.map(job => (
            <div key={job.id} className="data-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/technician/jobs/${job.id}`)}>
              <div className="data-card__header">
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                    REQ-{job.id}
                  </span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 2 }}>{job.service?.serviceName || 'Service Job'}</h3>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <div className="data-card__body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    Customer: {job.customer?.firstName} {job.customer?.lastName}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} />
                    <span>Completed / Scheduled: {formatDate(job.preferredDate)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} />
                    <span>{job.serviceAddress}</span>
                  </div>
                </div>
              </div>
              <div className="data-card__footer">
                <button className="btn btn--ghost btn--sm">
                  View Details & Work Report <ChevronRight size={14} />
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
