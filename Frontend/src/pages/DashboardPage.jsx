import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  Wrench,
  Users,
  CheckCircle,
  Plus,
  UserPlus,
  CalendarDays,
  AlertCircle,
  AlertTriangle,
  Receipt,
  Clock,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { getManagementDashboard } from '../services/dashboardService.js'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import PageContainer from '../components/layout/PageContainer.jsx'
import './DashboardPage.css'

// Maps string name in mock data to actual Lucide components
const iconMap = {
  ClipboardList,
  Wrench,
  Users,
  CheckCircle,
  Plus,
  UserPlus,
  CalendarDays,
  AlertCircle,
  AlertTriangle,
  Receipt
}

// ====================================
// Sub-Components for Dashboard
// ====================================

// 1. Dashboard Header
function DashboardHeader({ greeting }) {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="dashboard-header">
      <div>
        <h1 className="dashboard-header__title">{greeting}, Aniruddh</h1>
        <p className="dashboard-header__subtitle">Overview of today's field operations and requests.</p>
      </div>
      <div className="dashboard-header__date">
        <Clock size={16} />
        <span>{dateStr}</span>
      </div>
    </div>
  )
}

// 2. Stats Grid
function StatsGrid({ stats }) {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          iconName={stat.iconName}
          color={stat.color}
        />
      ))}
    </div>
  )
}

// 3. Stat Card
function StatCard({ label, value, change, iconName, color }) {
  const IconComponent = iconMap[iconName] || ClipboardList
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        <div className={`stat-card__icon stat-card__icon--${color}`}>
          <IconComponent size={20} />
        </div>
      </div>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__change">
        <TrendingUp size={14} />
        <span>{change}</span>
      </p>
    </div>
  )
}

// 4. Recent Service Requests
function RecentServiceRequests({ requests }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2>Recent Service Requests</h2>
        <Link to="/management/requests" className="dashboard-card__action">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      
      {/* Table view for Desktop/Tablet */}
      <div className="dashboard-card__table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Request</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td><span className="dashboard-table__req-id">{req.requestNumber}</span></td>
                <td>{req.customerName}</td>
                <td>{req.serviceName}</td>
                <td><StatusBadge status={req.status} /></td>
                <td className="dashboard-table__time">{req.preferredTime || 'Today'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stacked list view for small mobile screens */}
      <div className="dashboard-card__mobile-list">
        {requests.map(req => (
          <div key={req.id} className="dashboard-mobile-item">
            <div className="dashboard-mobile-item__header">
              <span className="dashboard-table__req-id">{req.requestNumber}</span>
              <StatusBadge status={req.status} />
            </div>
            <div className="dashboard-mobile-item__body">
              <p><strong>Customer:</strong> {req.customerName}</p>
              <p><strong>Service:</strong> {req.serviceName}</p>
            </div>
            <div className="dashboard-mobile-item__footer">
              <span className="dashboard-table__time">{req.preferredTime || 'Today'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 5. Active Jobs Overview
function ActiveJobsOverview({ jobs }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2>Active Jobs Overview</h2>
        <Link to="/management/schedule" className="dashboard-card__action">
          Manage Jobs <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="active-jobs-list">
        {jobs.length === 0 ? (
          <div className="active-jobs-empty">No active jobs at the moment.</div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="active-job-item">
              <div className="active-job-item__main">
                <div>
                  <h3 className="active-job-item__title">{job.serviceName}</h3>
                  <p className="active-job-item__meta">
                    <span>{job.customerName}</span>
                    <span className="active-job-item__divider">•</span>
                    <span>{job.assignedTechnicianName || 'Unassigned'}</span>
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// 6. Today's Schedule
function TodaysSchedule({ jobs }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2>Today's Schedule</h2>
        <Link to="/management/schedule" className="dashboard-card__action">
          View Schedule <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="schedule-timeline">
        {jobs.length === 0 ? (
          <div className="schedule-timeline__empty">No jobs scheduled for today.</div>
        ) : (
          jobs.map((item, index) => (
            <div key={index} className="schedule-item">
              <div className="schedule-item__time">{item.time}</div>
              <div className="schedule-item__timeline">
                <div className="schedule-item__dot"></div>
              </div>
              <div className="schedule-item__content">
                <h3 className="schedule-item__service">{item.service}</h3>
                <p className="schedule-item__meta">
                  <span>{item.customer}</span>
                  <span className="schedule-item__divider">•</span>
                  <span>{item.technician}</span>
                </p>
                <div className="schedule-item__badge-wrapper">
                  <StatusBadge status={item.status} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// 7. Quick Actions
function QuickActions({ actions }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2>Quick Actions</h2>
      </div>
      <div className="quick-actions-grid">
        {actions.map((action, index) => {
          const IconComponent = iconMap[action.iconName] || Plus
          return (
            <Link key={index} to={action.link} className="quick-action-btn">
              <div className={`quick-action-btn__icon quick-action-btn__icon--${action.color}`}>
                <IconComponent size={20} />
              </div>
              <div className="quick-action-btn__content">
                <span className="quick-action-btn__label">{action.label}</span>
                <span className="quick-action-btn__desc">{action.desc}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ====================================
// Main DashboardPage Component
// ====================================
function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Get greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true)
        setIsError(false)
        const data = await getManagementDashboard()
        setDashboardData(data)
      } catch (err) {
        console.error('Error loading management dashboard data:', err)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="customer-loading">
        <div className="customer-loading__spinner"></div>
        <p>Loading dashboard metrics...</p>
      </div>
    )
  }

  if (isError || !dashboardData) {
    return (
      <div className="customer-error-panel">
        <AlertCircle size={40} className="customer-error-panel__icon" />
        <h3>Unable to load dashboard</h3>
        <p>There was a problem loading the dashboard statistics.</p>
        <button
          className="customer-error-panel__btn"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    )
  }

  const { kpiCards, recentRequests, todaySchedule, quickActions, activeJobs } = dashboardData

  return (
    <PageContainer>
      <div className="dashboard-page">
        {/* Top welcome header */}
        <DashboardHeader greeting={greeting} />
        
        {/* KPI Stats cards */}
        <StatsGrid stats={kpiCards} />

        {/* 2-Column content section */}
        <div className="dashboard-content-grid">
          {/* Primary Main Column */}
          <div className="dashboard-content-grid__main">
            <RecentServiceRequests requests={recentRequests} />
            <ActiveJobsOverview jobs={activeJobs || []} />
          </div>

          {/* Secondary Side Column */}
          <div className="dashboard-content-grid__side">
            <TodaysSchedule jobs={todaySchedule} />
            <QuickActions actions={quickActions} />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default DashboardPage
