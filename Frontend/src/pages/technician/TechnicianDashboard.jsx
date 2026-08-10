import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Calendar, CheckCircle, Star, Clock, MapPin, ArrowRight } from 'lucide-react'
import '../customer/CustomerDashboard.css'
import '../DashboardPage.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { getTechnicianByUserId } from '../../services/technicianService.js'
import { getRequestsByTechnician } from '../../services/serviceRequestService.js'
import { getTechnicianSchedule } from '../../services/scheduleService.js'
import { formatDate } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function TechnicianDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [technician, setTechnician] = useState(null)
  const [stats, setStats] = useState({ active: 0, completed: 0 })
  const [schedule, setSchedule] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      setIsLoading(true)
      const tech = await getTechnicianByUserId(user.id)
      if (tech) {
        setTechnician(tech)
        const allJobs = await getRequestsByTechnician(tech.id)
        const active = allJobs.filter(j => ['Assigned', 'Accepted', 'OnTheWay', 'InProgress'].includes(j.status)).length
        const completed = allJobs.filter(j => ['Completed', 'Invoiced', 'PaymentDone', 'Closed'].includes(j.status)).length
        setStats({ active, completed })

        const sched = await getTechnicianSchedule(tech.id)
        setSchedule(sched.today)
      }
      setIsLoading(false)
    }
    load()
  }, [user])

  if (isLoading) return <PageContainer><LoadingState message="Loading technician dashboard..." /></PageContainer>

  return (
    <PageContainer>
      <div className="customer-hero">
        <h1 className="customer-hero__title">Welcome, {user?.firstName || 'Technician'}!</h1>
        <p className="customer-hero__subtitle">Access your schedule, active assignments, and job history.</p>
      </div>

      {technician && (
        <div className="customer-summary-grid">
          <div className="customer-summary-card">
            <div className="customer-summary-card__header">
              <span className="customer-summary-card__label">Active Jobs</span>
              <div className="customer-summary-card__icon customer-summary-card__icon--primary">
                <ClipboardList size={18} />
              </div>
            </div>
            <p className="customer-summary-card__value">{stats.active}</p>
            <span className="customer-summary-card__subtext">Currently assigned</span>
          </div>

          <div className="customer-summary-card">
            <div className="customer-summary-card__header">
              <span className="customer-summary-card__label">Completed Jobs</span>
              <div className="customer-summary-card__icon customer-summary-card__icon--success">
                <CheckCircle size={18} />
              </div>
            </div>
            <p className="customer-summary-card__value">{stats.completed}</p>
            <span className="customer-summary-card__subtext">Total all-time</span>
          </div>

          <div className="customer-summary-card">
            <div className="customer-summary-card__header">
              <span className="customer-summary-card__label">Performance Rating</span>
              <div className="customer-summary-card__icon customer-summary-card__icon--warning">
                <Star size={18} />
              </div>
            </div>
            <p className="customer-summary-card__value">⭐ {technician.rating}</p>
            <span className="customer-summary-card__subtext">Customer feedback score</span>
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      <div className="dashboard__grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h3>Today's Scheduled Jobs</h3>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/technician/jobs')}>
              View All Jobs <ArrowRight size={14} />
            </button>
          </div>
          {schedule.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
              No jobs scheduled for today.
            </div>
          ) : (
            <div className="dashboard__schedule-list" style={{ padding: 16 }}>
              {schedule.map(job => (
                <div
                  key={job.id}
                  className="dashboard__schedule-item"
                  style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid var(--color-border-light)' }}
                  onClick={() => navigate(`/technician/jobs/${job.id}`)}
                >
                  <div className="dashboard__schedule-time">{job.time}</div>
                  <div className="dashboard__schedule-details" style={{ marginLeft: 16 }}>
                    <p className="dashboard__schedule-job" style={{ fontWeight: 600 }}>{job.service}</p>
                    <p className="dashboard__schedule-meta" style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <span>{job.customer}</span>
                      <span style={{ margin: '0 6px' }}>•</span>
                      <span>{job.addressShortText}</span>
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default TechnicianDashboard