import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Search, ChevronRight, Eye, ShieldAlert } from 'lucide-react'
import { getAllServiceRequests } from '../../services/serviceRequestService.js'
import { getWorkReportByRequestId } from '../../services/workReportService.js'
import { formatDate } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function CompletedWorkPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [reportsMap, setReportsMap] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState('All') // 'All', 'PendingReview', 'Approved'

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const reqList = await getAllServiceRequests()
      // Filter requests that are WorkCompleted, Completed, or Invoiced
      const completedRequests = reqList.filter(r => 
        ['WorkCompleted', 'Completed', 'Invoiced', 'Paid', 'Closed'].includes(r.status)
      )

      // Fetch reports for all these requests to find review status
      const map = {}
      await Promise.all(
        completedRequests.map(async r => {
          const rpt = await getWorkReportByRequestId(r.id)
          if (rpt) {
            map[r.id] = rpt
          }
        })
      )
      setRequests(completedRequests)
      setReportsMap(map)
      setIsLoading(false)
    }
    load()
  }, [])

  const filtered = requests.filter(r => {
    const report = reportsMap[r.id]
    const reviewStatus = report ? report.reviewStatus : 'None'
    const invoiceStatus = r.status === 'Invoiced' || r.status === 'Paid' || r.status === 'Closed' ? 'Invoiced' : 'NotInvoiced'

    // Text search
    const matchesSearch =
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      (r.assignedTechnicianName && r.assignedTechnicianName.toLowerCase().includes(search.toLowerCase()))

    // Status tabs
    let matchesStatus = true
    if (filterMode === 'PendingReview') {
      matchesStatus = reviewStatus === 'PendingReview' || reviewStatus === 'CorrectionRequired'
    } else if (filterMode === 'Approved') {
      matchesStatus = reviewStatus === 'Approved' && invoiceStatus === 'NotInvoiced'
    }

    return matchesSearch && matchesStatus
  })

  if (isLoading) return <PageContainer><LoadingState message="Loading completed work..." /></PageContainer>

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">Completed Work</h1>
          <p className="page-header__subtitle">Review technician completion reports and generate customer invoices.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
        <button 
          className={`btn btn--sm ${filterMode === 'All' ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setFilterMode('All')}
        >
          All Completed ({requests.length})
        </button>
        <button 
          className={`btn btn--sm ${filterMode === 'PendingReview' ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setFilterMode('PendingReview')}
          style={{ position: 'relative' }}
        >
          Awaiting Review ({
            requests.filter(r => {
              const rStatus = reportsMap[r.id]?.reviewStatus
              return rStatus === 'PendingReview' || rStatus === 'CorrectionRequired'
            }).length
          })
        </button>
        <button 
          className={`btn btn--sm ${filterMode === 'Approved' ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setFilterMode('Approved')}
        >
          Approved & Ready to Invoice ({
            requests.filter(r => 
              reportsMap[r.id]?.reviewStatus === 'Approved' && !['Invoiced', 'Paid', 'Closed'].includes(r.status)
            ).length
          })
        </button>
      </div>

      <div className="filters-bar">
        <div className="filters-bar__search">
          <Search size={16} className="filters-bar__search-icon" />
          <input
            className="filters-bar__search-input"
            placeholder="Search by request #, customer, technician..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState 
          icon={ClipboardCheck} 
          title="No completed work found" 
          message="Try adjusting your tabs or search term." 
        />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Customer</th>
                <th>Service / Job</th>
                <th>Technician</th>
                <th>Report Status</th>
                <th>Invoice Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const report = reportsMap[r.id]
                const reviewStatus = report ? report.reviewStatus : 'None'
                const isInvoiced = ['Invoiced', 'Paid', 'Closed'].includes(r.status)

                // Label styling for review status
                let reviewLabel = 'No Report'
                let reviewBadgeClass = 'badge--pending'
                if (reviewStatus === 'PendingReview') {
                  reviewLabel = 'Pending Review'
                  reviewBadgeClass = 'badge--under-review'
                } else if (reviewStatus === 'CorrectionRequired') {
                  reviewLabel = 'Correction Requested'
                  reviewBadgeClass = 'badge--cancelled'
                } else if (reviewStatus === 'Approved') {
                  reviewLabel = 'Approved'
                  reviewBadgeClass = 'badge--completed'
                }

                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{r.requestNumber}</td>
                    <td style={{ fontWeight: 500 }}>{r.customerName}</td>
                    <td>{r.serviceName}</td>
                    <td>{r.assignedTechnicianName}</td>
                    <td>
                      <span className={`badge ${reviewBadgeClass}`}>{reviewLabel}</span>
                    </td>
                    <td>
                      <span className={`badge ${isInvoiced ? 'badge--completed' : 'badge--closed'}`}>
                        {isInvoiced ? 'Invoiced' : 'Not Invoiced'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button 
                          className="btn btn--outline btn--sm" 
                          onClick={() => navigate(`/management/requests/${r.id}/report`)}
                          title="Review technician's diagnostics and parts checklist"
                        >
                          <Eye size={13} style={{ marginRight: 4 }} /> Report
                        </button>
                        {reviewStatus === 'Approved' && !isInvoiced && (
                          <button 
                            className="btn btn--primary btn--sm"
                            onClick={() => navigate(`/management/invoices/create?requestId=${r.id}`)}
                          >
                            + Invoice
                          </button>
                        )}
                        {isInvoiced && (
                          <button 
                            className="btn btn--ghost btn--sm"
                            onClick={() => navigate(`/management/invoices`)}
                          >
                            View Invoice
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  )
}

export default CompletedWorkPage
