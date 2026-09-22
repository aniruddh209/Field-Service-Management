import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, CheckCircle, Star, ArrowRight, UserCheck } from 'lucide-react'
import '../customer/CustomerDashboard.css'
import '../DashboardPage.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { getTechnicianDashboard, updateMyWorkStatus } from '../../services/technicianService.js'
import { getAssignedServiceRequests } from '../../services/serviceRequestService.js'
import { formatDate } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function TechnicianDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [assignedJobs, setAssignedJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [dash, jobs] = await Promise.all([
        getTechnicianDashboard().catch(() => null),
        getAssignedServiceRequests().catch(() => [])
      ])
      setDashboardData(dash)
      setAssignedJobs(jobs)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value
    setIsUpdatingStatus(true)
    try {
      await updateMyWorkStatus(newStatus)
      await loadData()
    } catch (err) {
      console.error("Status update error:", err)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) return <PageContainer><LoadingState message="Loading technician dashboard..." /></PageContainer>

  const activeJobs = assignedJobs.filter(j => ['Assigned', 'InProgress'].includes(j.status))
  const completedJobs = assignedJobs.filter(j => j.status === 'Completed')

  return (
    <PageContainer>
      <div className="customer-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="customer-hero__title">Welcome, {user?.firstName || 'Technician'}!</h1>
          <p className="customer-hero__subtitle">Access your schedule, active assignments, and job performance.</p>
        </div>

        {dashboardData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <UserCheck size={18} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>My Work Status:</span>
            <select
              className="form-select"
              style={{ padding: '4px 8px', fontSize: '0.85rem' }}
              value={dashboardData.status || 'Available'}
              disabled={isUpdatingStatus}
              onChange={handleStatusChange}
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        )}
      </div>

      <div className="customer-summary-grid">
        <div className="customer-summary-card">
          <div className="customer-summary-card__header">
            <span className="customer-summary-card__label">Active Jobs</span>
            <div className="customer-summary-card__icon customer-summary-card__icon--primary">
              <ClipboardList size={18} />
            </div>
          </div>
          <p className="customer-summary-card__value">{dashboardData?.activeJobs ?? activeJobs.length}</p>
          <span className="customer-summary-card__subtext">Currently assigned to you</span>
        </div>

        <div className="customer-summary-card">
          <div className="customer-summary-card__header">
            <span className="customer-summary-card__label">Completed Jobs</span>
            <div className="customer-summary-card__icon customer-summary-card__icon--success">
              <CheckCircle size={18} />
            </div>
          </div>
          <p className="customer-summary-card__value">{dashboardData?.completedJobs ?? completedJobs.length}</p>
          <span className="customer-summary-card__subtext">Total all-time completed</span>
        </div>

        <div className="customer-summary-card">
          <div className="customer-summary-card__header">
            <span className="customer-summary-card__label">Rating Score</span>
            <div className="customer-summary-card__icon customer-summary-card__icon--warning">
              <Star size={18} />
            </div>
          </div>
          <p className="customer-summary-card__value">⭐ {dashboardData?.rating ?? 5}</p>
          <span className="customer-summary-card__subtext">Customer feedback rating</span>
        </div>
      </div>

      <div className="dashboard__grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h3>Active Assignments ({activeJobs.length})</h3>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/technician/jobs')}>
              View All Jobs <ArrowRight size={14} />
            </button>
          </div>
          {activeJobs.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
              No active jobs assigned at the moment.
            </div>
          ) : (
            <div className="dashboard__schedule-list" style={{ padding: 16 }}>
              {activeJobs.map(job => (
                <div
                  key={job.id}
                  className="dashboard__schedule-item"
                  style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid var(--color-border-light)' }}
                  onClick={() => navigate(`/technician/jobs/${job.id}`)}
                >
                  <div className="dashboard__schedule-details" style={{ marginLeft: 8 }}>
                    <p className="dashboard__schedule-job" style={{ fontWeight: 600 }}>
                      {job.service?.serviceName || `Job #${job.id}`}
                    </p>
                    <p className="dashboard__schedule-meta" style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <span>Customer: {job.customer?.firstName} {job.customer?.lastName}</span>
                      <span style={{ margin: '0 6px' }}>•</span>
                      <span>Address: {job.serviceAddress}</span>
                      <span style={{ margin: '0 6px' }}>•</span>
                      <span>Preferred Date: {formatDate(job.preferredDate)}</span>
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