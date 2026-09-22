import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, FileText, Search, Download, Eye } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getCustomerInvoices, downloadInvoicePdf } from '../../services/invoiceService.js'
import { formatCurrency, formatDate } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

// Map invoice statuses to badge-compatible keys
const invoiceStatusMap = {
  Pending: 'Pending',
  Paid: 'PaymentDone',
  Overdue: 'Cancelled'
}

function InvoicesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const data = await getCustomerInvoices(user?.id)
        setInvoices(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load invoices:', err)
        setInvoices([])
      } finally {
        setIsLoading(false)
      }
    }
    if (user?.id) load()
    else setIsLoading(false)
  }, [user?.id])

  const filtered = invoices.filter(inv => {
    const invNum = (inv.invoiceNumber || '').toLowerCase()
    const sName = (inv.serviceName || '').toLowerCase()
    const query = search.toLowerCase()
    const matchesSearch = !search || invNum.includes(query) || sName.includes(query)
    
    let matchesStatus = true
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending' || statusFilter === 'Unpaid') {
        matchesStatus = inv.status === 'Pending' || inv.status === 'Unpaid' || inv.status === 'Sent'
      } else {
        matchesStatus = inv.status === statusFilter
      }
    }
    return matchesSearch && matchesStatus
  })

  if (isLoading) return <PageContainer><LoadingState message="Loading invoices..." /></PageContainer>

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">My Invoices</h1>
          <p className="page-header__subtitle">View and track your service invoices</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-bar__search">
          <Search size={16} className="filters-bar__search-icon" />
          <input 
            className="filters-bar__search-input" 
            placeholder="Search invoices..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Unpaid / Pending</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState 
          icon={Receipt} 
          title={invoices.length === 0 ? "No Invoices Available" : "No invoices found"} 
          message={
            invoices.length === 0 
              ? "You don't have any service invoices yet. Invoices will appear here once your service requests are completed and billed." 
              : "No invoices match your selected filter criteria."
          }
          actionLabel={invoices.length === 0 ? "View Service Requests" : "Clear Filters"}
          onAction={
            invoices.length === 0 
              ? () => navigate('/customer/requests') 
              : () => { setSearch(''); setStatusFilter('All'); }
          }
        />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Service</th>
                <th>Request ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{inv.invoiceNumber}</td>
                  <td>{inv.serviceName || 'Service'}</td>
                  <td style={{ color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                    {inv.requestNumber || (inv.serviceRequestId ? `SR-${String(inv.serviceRequestId).padStart(4, '0')}` : 'N/A')}
                  </td>
                  <td>{formatDate(inv.issuedAt)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(inv.totalAmount)}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={() => navigate(`/customer/invoices/${inv.id}`)}
                      >
                        <Eye size={12} style={{ marginRight: 4 }} /> View
                      </button>
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => downloadInvoicePdf(inv.id, inv.invoiceNumber)}
                        title="Download Invoice PDF"
                      >
                        <Download size={12} style={{ marginRight: 4 }} /> PDF
                      </button>
                    </div>
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


export default InvoicesPage
