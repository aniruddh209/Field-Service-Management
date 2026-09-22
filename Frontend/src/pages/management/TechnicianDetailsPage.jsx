import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Phone, Mail, Calendar, Award, ShieldAlert } from 'lucide-react'
import { getTechnicianById, updateTechnician, toggleTechnicianActive, changeWorkStatus } from '../../services/technicianService.js'
import { getRequestsByTechnician } from '../../services/serviceRequestService.js'
import { getTechnicianStatus, statusBadgeClasses } from '../../utils/technicianHelpers.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatDate } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState, ErrorState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Modal from '../../components/ui/Modal.jsx'
import TechnicianForm from '../../components/technicians/TechnicianForm.jsx'

function TechnicianDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [technician, setTechnician] = useState(null)
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Modals & Feedback states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [tempStatus, setTempStatus] = useState('Active')

  const isManageAllowed = user?.role === 'Owner' || user?.role === 'Manager'

  const loadData = async () => {
    try {
      setIsLoading(true)
      const techData = await getTechnicianById(id)
      if (!techData) {
        setIsError(true)
        return
      }
      setTechnician(techData)
      setTempStatus(techData.status || 'Available')
      
      const jobsData = await getRequestsByTechnician(techData.id)
      setJobs(jobsData)
    } catch (err) {
      console.error(err)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleEditSubmit = async (formData) => {
    try {
      await updateTechnician(technician.id, formData)
      // Reload technician data from API
      const refreshed = await getTechnicianById(technician.id)
      if (refreshed) {
        setTechnician(refreshed)
        const jobsData = await getRequestsByTechnician(refreshed.id)
        setJobs(jobsData)
        setShowEditModal(false)
        showFeedback('Technician profile updated successfully')
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    try {
      await changeWorkStatus(technician.id, tempStatus)
      const refreshed = await getTechnicianById(technician.id)
      if (refreshed) {
        setTechnician(refreshed)
        setShowStatusModal(false)
        showFeedback('Work status updated successfully')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeactivate = async () => {
    try {
      await toggleTechnicianActive(technician.id)
      const refreshed = await getTechnicianById(technician.id)
      if (refreshed) {
        setTechnician(refreshed)
        setShowDeactivateModal(false)
        showFeedback('Technician deactivated successfully')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleActivate = async () => {
    try {
      await toggleTechnicianActive(technician.id)
      const refreshed = await getTechnicianById(technician.id)
      if (refreshed) {
        setTechnician(refreshed)
        showFeedback('Technician activated successfully')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const showFeedback = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  if (isLoading) return <PageContainer><LoadingState message="Loading technician details..." /></PageContainer>
  if (isError || !technician) return <PageContainer><ErrorState message="Technician not found." onRetry={() => navigate('/management/technicians')} /></PageContainer>

  const operationalStatus = getTechnicianStatus(technician)
  const badgeClass = statusBadgeClasses[operationalStatus] || 'badge--pending'

  // Detailed Workload metrics calculated from jobs list
  const metrics = {
    total: jobs.length,
    assigned: jobs.filter(j => j.status === 'Assigned').length,
    accepted: jobs.filter(j => j.status === 'Accepted').length,
    inProgress: jobs.filter(j => j.status === 'InProgress').length,
    completed: jobs.filter(j => j.status === 'Completed' || j.status === 'Closed' || j.status === 'PaymentDone').length
  }

  return (
    <PageContainer>
      {/* Toast Notification */}
      {successMessage && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          background: 'var(--color-success)', color: 'white',
          padding: '12px 24px', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--dropdown-shadow)', fontSize: '0.88rem',
          fontWeight: 600, animation: 'fadeIn 0.2s ease'
        }}>
          {successMessage}
        </div>
      )}

      {/* Navigation and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate('/management/technicians')}>
          <ArrowLeft size={16} /> Back to Technicians
        </button>
        
        {isManageAllowed && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--outline btn--sm" onClick={() => setShowEditModal(true)}>
              Edit Profile
            </button>
            <button className="btn btn--outline btn--sm" onClick={() => setShowStatusModal(true)}>
              Manage Status
            </button>
            {technician.isActive ? (
              <button className="btn btn--danger btn--outline btn--sm" onClick={() => setShowDeactivateModal(true)}>
                Deactivate
              </button>
            ) : (
              <button className="btn btn--success btn--outline btn--sm" onClick={handleActivate}>
                Activate
              </button>
            )}
          </div>
        )}
      </div>

      {/* Profile Summary Card */}
      <div className="detail-section">
        <div className="detail-section__body" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--color-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '1.8rem', flexShrink: 0
          }}>
            {technician.fullName ? technician.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>{technician.fullName}</h1>
              {!technician.isActive && <span className="badge badge--cancelled">Disabled Account</span>}
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
              Code: <strong>{technician.employeeCode}</strong> · Specialization: <strong>{technician.specialization}</strong>
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center' }}>
              <span className={`badge ${badgeClass}`}>{operationalStatus}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
                <Star size={15} style={{ color: 'var(--color-warning)', fill: 'var(--color-warning)' }} />
                <strong>{technician.rating > 0 ? technician.rating : 'New'}</strong> rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Work Information and Detailed Workload */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
        
        {/* Contact and Work Information */}
        <div className="detail-section" style={{ height: '100%' }}>
          <div className="detail-section__header">
            <h3 className="detail-section__title">Technician Profile Details</h3>
          </div>
          <div className="detail-section__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Mail size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: 0 }}>Email Address</p>
                  <p style={{ fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>{technician.email}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Phone size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: 0 }}>Phone Number</p>
                  <p style={{ fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>{technician.phone}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Calendar size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: 0 }}>Joining Date</p>
                  <p style={{ fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>{formatDate(technician.joiningDate) || 'Not recorded'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Award size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', margin: 0 }}>Employment Status</p>
                  <p style={{ fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>{technician.status || 'Available'}</p>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '8px 0' }} />

              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginBottom: 4, marginTop: 0 }}>Short Notes / Internal Memo</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0, background: 'var(--color-surface-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', whiteSpace: 'pre-wrap' }}>
                  {technician.notes || 'No custom notes recorded for this technician.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Workload Metrics */}
        <div className="detail-section" style={{ height: '100%' }}>
          <div className="detail-section__header">
            <h3 className="detail-section__title">Field Service Workload</h3>
          </div>
          <div className="detail-section__body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
              <div style={{ padding: 16, background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 700, display: 'block', color: 'var(--color-primary)' }}>{technician.activeJobs}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Active Jobs (Workload)</span>
              </div>
              <div style={{ padding: 16, background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 700, display: 'block', color: 'var(--color-success)' }}>{metrics.completed}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Completed Jobs</span>
              </div>
            </div>

            <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12 }}>Workload Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingBottom: 6, borderBottom: '1px solid var(--color-border-light)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Assigned requests (unaccepted)</span>
                <span style={{ fontWeight: 600 }}>{metrics.assigned}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingBottom: 6, borderBottom: '1px solid var(--color-border-light)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Accepted requests</span>
                <span style={{ fontWeight: 600 }}>{metrics.accepted}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingBottom: 6, borderBottom: '1px solid var(--color-border-light)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>In-progress jobs</span>
                <span style={{ fontWeight: 600 }}>{metrics.inProgress}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Total assigned history</span>
                <span style={{ fontWeight: 600 }}>{metrics.total}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Jobs Assigned Section */}
      <div className="detail-section">
        <div className="detail-section__header">
          <h3 className="detail-section__title">Job History & Assignments ({jobs.length})</h3>
        </div>
        <div className="detail-section__body">
          {jobs.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>No jobs assigned to this technician yet.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Request #</th>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{job.requestNumber}</td>
                      <td>{job.serviceName}</td>
                      <td>{job.customerName}</td>
                      <td>{formatDate(job.preferredDate)}</td>
                      <td><StatusBadge status={job.status} /></td>
                      <td>
                        <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/management/requests/${job.id}`)}>
                          View Request
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Edit Profile */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Technician Profile"
        size="lg"
      >
        <TechnicianForm
          mode="edit"
          initialValues={technician}
          onSubmit={handleEditSubmit}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Modal 2: Manage Status */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Manage Employment Status"
        size="sm"
      >
        <form onSubmit={handleStatusSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="employmentStatusField">Employment Status</label>
            <select
              id="employmentStatusField"
              className="form-select"
              value={tempStatus}
              onChange={e => setTempStatus(e.target.value)}
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="On Leave">On Leave</option>
            </select>
            <span className="form-hint" style={{ marginTop: 4 }}>
              Operational Busy/Available statuses are derived dynamically from technician workload.
            </span>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Save Status
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Deactivate Confirmation */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Deactivate Technician?"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', color: 'var(--color-danger)' }}>
            <ShieldAlert size={24} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
              This technician will no longer be available for new job assignments. Existing service history will remain available.
            </p>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => setShowDeactivateModal(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn--danger" onClick={handleDeactivate}>
              Deactivate
            </button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}

export default TechnicianDetailsPage