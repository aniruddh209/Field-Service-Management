import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ClipboardList, Calendar, User, ChevronRight } from 'lucide-react'
import { getAllServiceRequests } from '../../services/serviceRequestService.js'
import { formatDate, formatStatus } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

const STATUS_OPTIONS = ['All', 'Pending', 'UnderReview', 'Assigned', 'Accepted', 'OnTheWay', 'InProgress', 'Completed', 'Invoiced', 'PaymentDone', 'Closed', 'Cancelled']

function ManagementRequestsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const data = await getAllServiceRequests()
      setRequests(data)
      setIsLoading(false)
    }
    load()
  }, [])

  const filtered = requests.filter(r => {
    const matchesSearch = search === '' ||
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.serviceName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) return <PageContainer><LoadingState message="Loading all requests..." /></PageContainer>

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">Service Requests</h1>
          <p className="page-header__subtitle">Manage and track all service requests</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-bar__search">
          <Search size={16} className="filters-bar__search-icon" />
          <input className="filters-bar__search-input" placeholder="Search by request #, customer, or service..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : formatStatus(s)}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No requests found" message="Try adjusting your filters." />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Date</th>
                <th>Technician</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{req.requestNumber}</td>
                  <td>{req.customerName}</td>
                  <td>{req.serviceName}</td>
                  <td>{formatDate(req.preferredDate)}</td>
                  <td>{req.assignedTechnicianName || <span style={{ color: 'var(--color-text-tertiary)' }}>Unassigned</span>}</td>
                  <td><StatusBadge status={req.status} /></td>
                  <td>
                    <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/management/requests/${req.id}`)}>
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  )
}

export default ManagementRequestsPage
