import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ClipboardList, Calendar, MapPin, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAssignedServiceRequests } from '../../services/serviceRequestService.js'
import { formatDate } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function AssignedJobsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Active')

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      setIsLoading(true)
      try {
        const data = await getAssignedServiceRequests()
        setJobs(data)
      } catch (err) {
        console.error("Error loading assigned jobs:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user])

  const filtered = jobs.filter(job => {
    const reqNum = `REQ-${job.id}`
    const custName = `${job.customer?.firstName || ''} ${job.customer?.lastName || ''}`.trim()
    const srvName = job.service?.serviceName || ''

    const matchesSearch =
      reqNum.toLowerCase().includes(search.toLowerCase()) ||
      custName.toLowerCase().includes(search.toLowerCase()) ||
      srvName.toLowerCase().includes(search.toLowerCase())

    const isActive = ['Assigned', 'Accepted', 'OnTheWay', 'InProgress'].includes(job.status)
    const isDone = ['Completed', 'Invoiced', 'PaymentDone', 'Closed'].includes(job.status)

    if (statusFilter === 'Active') return matchesSearch && isActive
    if (statusFilter === 'Completed') return matchesSearch && isDone
    return matchesSearch
  })

  if (isLoading) return <PageContainer><LoadingState message="Loading jobs..." /></PageContainer>

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">My Assignments</h1>
          <p className="page-header__subtitle">Manage and perform your assigned service jobs</p>
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
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="Active">Active Jobs</option>
          <option value="Completed">Completed Jobs</option>
          <option value="All">All Assignments</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No jobs found" message="No jobs matching the selected filter." />
      ) : (
        <div className="cards-grid">
          {filtered.map(job => (
            <div key={job.id} className="data-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/technician/jobs/${job.id}`)}>
              <div className="data-card__header">
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                    REQ-{job.id}
                  </span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 2 }}>{job.service?.serviceName || 'Service Request'}</h3>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <div className="data-card__body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    Customer: {job.customer?.firstName} {job.customer?.lastName} ({job.customer?.phoneNumber})
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} />
                    <span>Preferred Date: {formatDate(job.preferredDate)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} />
                    <span>{job.serviceAddress}</span>
                  </div>
                </div>
              </div>
              <div className="data-card__footer">
                <button className="btn btn--ghost btn--sm">
                  View & Perform Job <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

export default AssignedJobsPage