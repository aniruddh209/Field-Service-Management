import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, FileText, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getCustomerInvoices } from '../../services/invoiceService.js'
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
      const data = await getCustomerInvoices(user.id)
      setInvoices(data)
      setIsLoading(false)
    }
    if (user?.id) load()
  }, [user?.id])

  const filtered = invoices.filter(inv => {
    const matchesSearch = search === '' || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || inv.serviceName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter
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
          <input className="filters-bar__search-input" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Receipt} title="No invoices found" message={search || statusFilter !== 'All' ? 'Try adjusting your filters.' : 'No invoices have been generated yet.'} />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Service</th>
                <th>Request</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/customer/invoices/${inv.id}`)}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{inv.invoiceNumber}</td>
                  <td>{inv.serviceName}</td>
                  <td style={{ color: 'var(--color-text-tertiary)' }}>{inv.requestNumber}</td>
                  <td>{formatDate(inv.issuedAt)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(inv.totalAmount)}</td>
                  <td><StatusBadge status={invoiceStatusMap[inv.status] || inv.status} /></td>
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
