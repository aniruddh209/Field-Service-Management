import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon, Clock, ClipboardList, MapPin } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getTechnicianSchedule } from '../../services/scheduleService.js'
import { formatDate } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function TechnicianSchedulePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [schedule, setSchedule] = useState({ today: [], upcoming: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('today')

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      setIsLoading(true)
      try {
        const data = await getTechnicianSchedule()
        setSchedule(data)
      } catch (err) {
        console.error("Error loading schedule:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user])

  if (isLoading) return <PageContainer><LoadingState message="Loading schedule..." /></PageContainer>

  const displayedJobs = activeTab === 'today' ? schedule.today : schedule.upcoming

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">My Schedule</h1>
          <p className="page-header__subtitle">Track your upcoming appointments and slots</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', marginBottom: 20 }}>
        <button
          className="btn btn--sm"
          style={{
            borderBottom: activeTab === 'today' ? '2px solid var(--color-primary)' : 'none',
            color: activeTab === 'today' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            background: 'transparent',
            borderRadius: 0,
            paddingBottom: 8
          }}
          onClick={() => setActiveTab('today')}
        >
          Today's Schedule ({schedule.today.length})
        </button>
        <button
          className="btn btn--sm"
          style={{
            borderBottom: activeTab === 'upcoming' ? '2px solid var(--color-primary)' : 'none',
            color: activeTab === 'upcoming' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            background: 'transparent',
            borderRadius: 0,
            paddingBottom: 8
          }}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming / Other Jobs ({schedule.upcoming.length})
        </button>
      </div>

      {displayedJobs.length === 0 ? (
        <div className="page-state page-state--empty">
          <CalendarIcon size={40} className="page-state__icon" />
          <h3 className="page-state__title">No jobs scheduled</h3>
          <p className="page-state__message">There are no assignments for this timeframe.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayedJobs.map(job => (
            <div key={job.id} className="data-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/technician/jobs/${job.id}`)}>
              <div className="data-card__header" style={{ alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{job.service?.serviceName || `REQ-${job.id}`}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      REQ-{job.id} · {formatDate(job.preferredDate)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <div className="data-card__body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                  <ClipboardList size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                  <span>Customer: <strong>{job.customer?.firstName} {job.customer?.lastName}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                  <MapPin size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                  <span>Location: <strong>{job.serviceAddress}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

export default TechnicianSchedulePage