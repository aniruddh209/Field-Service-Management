import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  MapPin,
  Package,
  Receipt,
  Calendar,
  Clock,
  User,
  Plus,
  ArrowRight,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getCustomerDashboard } from '../../services/dashboardService.js'
import { formatCurrency, formatStatus, formatDate } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import './CustomerDashboard.css'

function CustomerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // State Management
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Calculate dynamic greeting based on system time
  const getGreeting = () => {
    const hours = new Date().getHours()
    if (hours < 12) return 'Good morning'
    if (hours < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Fetch dashboard data on mount
  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.id) return;
      try {
        setIsLoading(true)
        setIsError(false)

        const data = await getCustomerDashboard(Number(user.id))
        setDashboardData(data)
      } catch (err) {
        console.error('Error fetching customer dashboard data:', err)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.id])

  if (isLoading) {
    return (
      <div className="customer-loading">
        <div className="customer-loading__spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="customer-error-panel">
        <AlertCircle size={40} className="customer-error-panel__icon" />
        <h3>Unable to load dashboard</h3>
        <p>There was a problem loading your service requests and history.</p>
        <button
          className="customer-error-panel__btn"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    )
  }

  const { summary, activeRequests, upcomingAppointment, recentHistory, pendingPayment } = dashboardData || {}

  // Define step indicator configurations
  const progressSteps = ['Created', 'Assigned', 'In Progress', 'Completed']

  return (
    <div className="customer-dashboard">
      {/* ---- HERO AREA ---- */}
      <div className="customer-hero">
        <div className="customer-hero__left">
          <h1 className="customer-hero__title">
            {getGreeting()}, {user?.firstName || 'Valued Customer'}
          </h1>
          <p className="customer-hero__subtitle">
            Manage your service requests, appointments, and recent activity from one place.
          </p>
        </div>
        <div className="customer-hero__right">
          <button
            className="customer-hero__btn-secondary"
            onClick={() => navigate('/customer/services')}
          >
            Browse Services
          </button>
          <button
            className="customer-hero__btn-primary"
            onClick={() => navigate('/customer/requests/new')}
          >
            <Plus size={18} />
            New Service Request
          </button>
        </div>
      </div>

      {/* ---- PAYMENT REMINDER BANNER ---- */}
      {pendingPayment && (
        <div className="customer-payment-reminder">
          <div className="customer-payment-reminder__content">
            <Receipt size={20} className="customer-payment-reminder__icon" />
            <div className="customer-payment-reminder__text">
              <span className="customer-payment-reminder__badge">Payment Pending</span>
              <p>
                Invoice <strong>{pendingPayment.invoiceId}</strong> for outstanding services is due: <strong>{formatCurrency(pendingPayment.amount)}</strong>
              </p>
            </div>
          </div>
          <button
            className="customer-payment-reminder__btn"
            onClick={() => navigate(pendingPayment.path)}
          >
            View Invoice
          </button>
        </div>
      )}

      {/* ---- SUMMARY KPI CARDS ---- */}
      {summary && (
        <div className="customer-summary-grid">
          <div className="customer-summary-card">
            <div className="customer-summary-card__header">
              <span className="customer-summary-card__label">Active Requests</span>
              <div className="customer-summary-card__icon customer-summary-card__icon--primary">
                <ClipboardList size={18} />
              </div>
            </div>
            <p className="customer-summary-card__value">{summary.activeRequestsCount}</p>
            <span className="customer-summary-card__subtext">1 currently in progress</span>
          </div>

          <div className="customer-summary-card">
            <div className="customer-summary-card__header">
              <span className="customer-summary-card__label">Upcoming Appointment</span>
              <div className="customer-summary-card__icon customer-summary-card__icon--info">
                <Calendar size={18} />
              </div>
            </div>
            <p className="customer-summary-card__value">
              {upcomingAppointment ? formatDate(upcomingAppointment.date) : '-'}
            </p>
            <span className="customer-summary-card__subtext">
              {upcomingAppointment ? `${upcomingAppointment.time} · ${upcomingAppointment.serviceName}` : 'No scheduled jobs'}
            </span>
          </div>

          <div className="customer-summary-card">
            <div className="customer-summary-card__header">
              <span className="customer-summary-card__label">Completed Services</span>
              <div className="customer-summary-card__icon customer-summary-card__icon--success">
                <Package size={18} />
              </div>
            </div>
            <p className="customer-summary-card__value">{summary.completedServicesCount}</p>
            <span className="customer-summary-card__subtext">2 completed this month</span>
          </div>

          <div className="customer-summary-card">
            <div className="customer-summary-card__header">
              <span className="customer-summary-card__label">Pending Payment</span>
              <div className="customer-summary-card__icon customer-summary-card__icon--warning">
                <Receipt size={18} />
              </div>
            </div>
            <p className="customer-summary-card__value">{formatCurrency(summary.pendingPaymentAmount)}</p>
            <span className="customer-summary-card__subtext">
              {summary.pendingPaymentCount} unpaid {summary.pendingPaymentCount === 1 ? 'invoice' : 'invoices'}
            </span>
          </div>
        </div>
      )}

      {/* ---- MAIN CONTENT GRID ---- */}
      <div className="customer-dashboard__grid">
        <div className="customer-dashboard__main">
          {/* Active Service Requests */}
          <div className="customer-section">
            <h2 className="customer-section__title">Active Service Requests</h2>
            
            {!activeRequests || activeRequests.length === 0 ? (
              <div className="customer-empty-state">
                <ClipboardList size={36} className="customer-empty-state__icon" />
                <p className="customer-empty-state__title">No active requests</p>
                <p className="customer-empty-state__msg">You do not have any active service requests right now.</p>
                <button
                  className="customer-empty-state__btn"
                  onClick={() => navigate('/customer/services')}
                >
                  Book a Service
                </button>
              </div>
            ) : (
              <div className="customer-requests-list">
                {activeRequests.map(req => (
                  <div key={req.id} className="customer-request-card">
                    <div className="customer-request-card__header">
                      <div>
                        <span className="customer-request-card__id">{req.requestNumber}</span>
                        <h3 className="customer-request-card__service">{req.serviceName}</h3>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="customer-request-card__details">
                      <div className="customer-request-card__detail">
                        <Calendar size={14} />
                        <span>Preferred: {formatDate(req.preferredDate)} · {req.preferredTime}</span>
                      </div>
                      {req.assignedTechnicianName && (
                        <div className="customer-request-card__detail">
                          <User size={14} />
                          <span>Technician: {req.assignedTechnicianName}</span>
                        </div>
                      )}
                      <div className="customer-request-card__detail">
                        <MapPin size={14} />
                        <span>Address: {req.addressShortText}</span>
                      </div>
                    </div>

                    {/* Progress Step Visual */}
                    <div className="customer-request-card__progress">
                      <div className="customer-progress-bar">
                        {progressSteps.map((step, idx) => {
                          const isCompleted = idx <= req.progressStep
                          const isActive = idx === req.progressStep
                          return (
                            <div
                              key={step}
                              className={`customer-progress-step ${
                                isCompleted ? 'customer-progress-step--completed' : ''
                              } ${isActive ? 'customer-progress-step--active' : ''}`}
                            >
                              <div className="customer-progress-dot">
                                {isCompleted && <span className="customer-progress-check">✓</span>}
                              </div>
                              <span className="customer-progress-label">{step}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="customer-request-card__footer">
                      <button
                        className="customer-request-card__btn"
                        onClick={() => navigate(`/customer/requests/${req.id}`)}
                      >
                        View Details
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Service History */}
          <div className="customer-section">
            <h2 className="customer-section__title">Recent Service History</h2>
            {!recentHistory || recentHistory.length === 0 ? (
              <div className="customer-empty-state">
                <p className="customer-empty-state__msg">No previous service history found.</p>
              </div>
            ) : (
              <div className="customer-history-card">
                <div className="customer-history-table-wrap">
                  <table className="customer-history-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Request ID</th>
                        <th>Date</th>
                        <th>Technician</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentHistory.map(item => (
                        <tr key={item.id}>
                          <td className="customer-history-table__service">{item.serviceName}</td>
                          <td className="customer-history-table__id">{item.requestNumber}</td>
                          <td>{formatDate(item.preferredDate)}</td>
                          <td>{item.assignedTechnicianName || 'Unassigned'}</td>
                          <td>
                            <StatusBadge status={item.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile list view for history table */}
                <div className="customer-history-list-mobile">
                  {recentHistory.map(item => (
                    <div key={item.id} className="customer-history-mobile-item">
                      <div className="customer-history-mobile-item__header">
                        <div>
                          <h4>{item.serviceName}</h4>
                          <span>{item.requestNumber}</span>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="customer-history-mobile-item__meta">
                        <div>
                          <span>Date:</span>
                          <strong>{formatDate(item.preferredDate)}</strong>
                        </div>
                        <div>
                          <span>Technician:</span>
                          <strong>{item.assignedTechnicianName || 'Unassigned'}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIDE PANEL (Upcoming Appointment + Quick Actions) */}
        <div className="customer-dashboard__side">
          {/* Upcoming Appointment Detail Card */}
          {upcomingAppointment && (
            <div className="customer-sidebar-card">
              <h3 className="customer-sidebar-card__title">Upcoming Appointment</h3>
              <div className="customer-appointment-detail">
                <div className="customer-appointment-detail__header">
                  <Calendar size={18} className="customer-appointment-detail__icon" />
                  <div>
                    <h4>{upcomingAppointment.serviceName}</h4>
                    <p>{formatDate(upcomingAppointment.date)}, {upcomingAppointment.time}</p>
                  </div>
                </div>

                <div className="customer-appointment-detail__info">
                  <div className="customer-appointment-detail__info-item">
                    <User size={14} />
                    <span>Technician: <strong>{upcomingAppointment.technicianName}</strong></span>
                  </div>
                  <div className="customer-appointment-detail__info-item">
                    <MapPin size={14} />
                    <span>Location: <strong>{upcomingAppointment.location}</strong></span>
                  </div>
                </div>

                <div className="customer-appointment-detail__actions">
                  <button
                    className="customer-appointment-detail__btn-primary"
                    onClick={() => navigate(`/customer/requests/${upcomingAppointment.requestId}`)}
                  >
                    View Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="customer-sidebar-card">
            <h3 className="customer-sidebar-card__title">Quick Actions</h3>
            <div className="customer-quick-actions">
              <button
                className="customer-quick-action-btn"
                onClick={() => navigate('/customer/services')}
              >
                <div className="customer-quick-action-btn__icon customer-quick-action-btn__icon--primary">
                  <Wrench size={18} />
                </div>
                <div className="customer-quick-action-btn__content">
                  <span className="customer-quick-action-btn__label">Book a Service</span>
                  <span className="customer-quick-action-btn__desc">Choose a service and schedule a visit</span>
                </div>
                <ArrowRight size={14} className="customer-quick-action-btn__chevron" />
              </button>

              <button
                className="customer-quick-action-btn"
                onClick={() => navigate('/customer/requests')}
              >
                <div className="customer-quick-action-btn__icon customer-quick-action-btn__icon--info">
                  <ClipboardList size={18} />
                </div>
                <div className="customer-quick-action-btn__content">
                  <span className="customer-quick-action-btn__label">My Requests</span>
                  <span className="customer-quick-action-btn__desc">Track current and previous requests</span>
                </div>
                <ArrowRight size={14} className="customer-quick-action-btn__chevron" />
              </button>

              <button
                className="customer-quick-action-btn"
                onClick={() => navigate('/customer/addresses')}
              >
                <div className="customer-quick-action-btn__icon customer-quick-action-btn__icon--warning">
                  <MapPin size={18} />
                </div>
                <div className="customer-quick-action-btn__content">
                  <span className="customer-quick-action-btn__label">Add Address</span>
                  <span className="customer-quick-action-btn__desc">Save a new service location</span>
                </div>
                <ArrowRight size={14} className="customer-quick-action-btn__chevron" />
              </button>

              <button
                className="customer-quick-action-btn"
                onClick={() => navigate('/customer/assets')}
              >
                <div className="customer-quick-action-btn__icon customer-quick-action-btn__icon--success">
                  <Package size={18} />
                </div>
                <div className="customer-quick-action-btn__content">
                  <span className="customer-quick-action-btn__label">Add Asset</span>
                  <span className="customer-quick-action-btn__desc">Register equipment for faster service</span>
                </div>
                <ArrowRight size={14} className="customer-quick-action-btn__chevron" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
