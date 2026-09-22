import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Receipt, Search, FileText, Send, Eye, Edit3, Bell, Download } from 'lucide-react'
import { getAllInvoices, createInvoice, downloadInvoicePdf } from '../../services/invoiceService.js'
import { getAllServiceRequests } from '../../services/serviceRequestService.js'
import { getWorkReportByRequestId } from '../../services/workReportService.js'
import { formatCurrency, formatDate } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function ManagementInvoicesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filterParam = searchParams.get('filter')

  const [invoices, setInvoices] = useState([])
  const [pendingOrders, setPendingOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  
  // Tab control: 'Invoices' or 'PendingGeneration'
  const [activeTab, setActiveTab] = useState('Invoices')
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const [invData, reqList] = await Promise.all([
          getAllInvoices().catch(() => []),
          getAllServiceRequests().catch(() => [])
        ])
        
        const invoicesList = Array.isArray(invData) ? invData : []
        setInvoices(invoicesList)

        // Find completed approved requests without invoices
        const pendingList = []
        if (Array.isArray(reqList)) {
          for (const r of reqList) {
            if (r.status === 'Completed' || r.status === 'WorkCompleted') {
              const report = await getWorkReportByRequestId(r.id).catch(() => null)
              if (report && (report.reviewStatus === 'Approved' || report.managerReviewStatus === 'Approved')) {
                const hasInvoice = invoicesList.find(i => i.serviceRequestId === r.id)
                if (!hasInvoice) {
                  pendingList.push(r)
                }
              }
            }
          }
        }
        setPendingOrders(pendingList)

        if (filterParam === 'pending-generation') {
          setActiveTab('PendingGeneration')
        } else {
          setActiveTab('Invoices')
        }
      } catch (err) {
        console.error('Failed to load billing dashboard:', err)
        setInvoices([])
        setPendingOrders([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [filterParam])

  // Summary Metrics calculations
  const totalCount = invoices.length
  const unpaidCount = invoices.filter(i => ['Pending', 'Unpaid', 'Sent'].includes(i.status)).length
  const paidCount = invoices.filter(i => i.status === 'Paid').length
  const overdueCount = invoices.filter(i => i.status === 'Overdue' || i.status === 'Cancelled').length

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  const handleSendInvoice = (invNum, customer) => {
    showToast(`Invoice ${invNum} has been successfully sent to ${customer}.`)
  }

  const handleSendReminder = (invNum, customer) => {
    showToast(`Payment reminder notification sent to ${customer} for invoice ${invNum}.`)
  }

  const filteredInvoices = invoices.filter(inv => {
    const invNum = (inv.invoiceNumber || '').toLowerCase()
    const cName = (inv.customerName || '').toLowerCase()
    const sName = (inv.serviceName || '').toLowerCase()
    const q = search.toLowerCase()

    const matchesSearch = !search || invNum.includes(q) || cName.includes(q) || sName.includes(q)
    
    let matchesStatus = true
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending') {
        matchesStatus = ['Pending', 'Unpaid', 'Sent'].includes(inv.status)
      } else {
        matchesStatus = inv.status === statusFilter
      }
    }
    return matchesSearch && matchesStatus
  })

  if (isLoading) return <PageContainer><LoadingState message="Loading billing dashboards..." /></PageContainer>

  return (
    <PageContainer>
      {/* Toast message */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          background: 'var(--color-success)', color: 'white',
          padding: '12px 24px', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--dropdown-shadow)', fontSize: '0.88rem',
          fontWeight: 600, animation: 'fadeIn 0.2s ease'
        }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div className="page-header__info">
          <h1 className="page-header__title">Invoices</h1>
          <p className="page-header__subtitle">Create, review, send, and track customer invoices.</p>
        </div>
        <button className="btn btn--primary" onClick={() => navigate('/management/invoices/create')}>
          + Generate Invoice
        </button>
      </div>

      {/* Summary KPI Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Invoices</span>
          <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, marginTop: 4, color: 'var(--color-text)' }}>{totalCount}</span>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-warning)', fontWeight: 600 }}>Unpaid</span>
          <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, marginTop: 4, color: 'var(--color-warning)' }}>{unpaidCount}</span>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600 }}>Paid</span>
          <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, marginTop: 4, color: 'var(--color-success)' }}>{paidCount}</span>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-danger)', fontWeight: 600 }}>Overdue / Cancelled</span>
          <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, marginTop: 4, color: 'var(--color-danger)' }}>{overdueCount}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
        <button
          className={`btn btn--sm ${activeTab === 'Invoices' ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setActiveTab('Invoices')}
        >
          All Invoices ({invoices.length})
        </button>
        <button
          className={`btn btn--sm ${activeTab === 'PendingGeneration' ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setActiveTab('PendingGeneration')}
          style={{ position: 'relative' }}
        >
          Awaiting Generation ({pendingOrders.length})
          {pendingOrders.length > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} />
          )}
        </button>
      </div>

      {activeTab === 'PendingGeneration' ? (
        <div>
          {pendingOrders.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No pending invoices"
              message="All completed service requests have been billed."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingOrders.map(order => (
                <div key={order.id} className="data-card">
                  <div className="data-card__body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, padding: 16 }}>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '0.92rem', margin: '0 0 4px 0', color: 'var(--color-primary)' }}>
                        {order.requestNumber || `SR-${String(order.id).padStart(4, '0')}`} — {order.serviceName || 'Service'}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                        Customer: <strong>{order.customerName || 'Customer'}</strong> · Technician: {order.assignedTechnicianName || 'Unassigned'}
                      </p>
                    </div>
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => navigate(`/management/invoices/create?requestId=${order.id}`)}
                    >
                      + Generate Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filters Search & Select */}
          <div className="filters-bar">
            <div className="filters-bar__search">
              <Search size={16} className="filters-bar__search-icon" />
              <input
                className="filters-bar__search-input"
                placeholder="Search by invoice #, customer, service..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ maxWidth: 200 }}>
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Unpaid / Sent</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {filteredInvoices.length === 0 ? (
            <EmptyState 
              icon={Receipt} 
              title={invoices.length === 0 ? "No Invoices Created" : "No invoices found"} 
              message={
                invoices.length === 0 
                  ? "No customer invoices have been generated yet. Click generate invoice to create an invoice from completed work." 
                  : "No invoices match your search query or status filter."
              } 
              actionLabel={invoices.length === 0 ? "+ Generate Invoice" : "Clear Filters"}
              onAction={
                invoices.length === 0 
                  ? () => navigate('/management/invoices/create') 
                  : () => { setSearch(''); setStatusFilter('All'); }
              }
            />
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Request ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(inv => {
                    const isDraft = inv.status === 'Draft'
                    const isPaid = inv.status === 'Paid'
                    const reqNum = inv.requestNumber || (inv.serviceRequestId ? `SR-${String(inv.serviceRequestId).padStart(4, '0')}` : 'N/A')
                    const dueDateStr = inv.dueDate || (inv.issuedAt ? new Date(new Date(inv.issuedAt).getTime() + 7*24*60*60*1000).toISOString() : null)

                    return (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{inv.invoiceNumber}</td>
                        <td style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{reqNum}</td>
                        <td style={{ fontWeight: 500 }}>{inv.customerName || 'Customer'}</td>
                        <td>{inv.serviceName || 'Service'}</td>
                        <td>{formatDate(inv.issuedAt)}</td>
                        <td>{formatDate(dueDateStr)}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(inv.totalAmount)}</td>
                        <td><StatusBadge status={inv.status} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button 
                              className="btn btn--outline btn--sm" 
                              onClick={() => navigate(`/management/invoices/${inv.id}`)}
                            >
                              <Eye size={12} style={{ marginRight: 4 }} /> View
                            </button>
                            <button
                              className="btn btn--outline btn--sm"
                              onClick={() => downloadInvoicePdf(inv.id, inv.invoiceNumber)}
                              title="Download Invoice PDF"
                            >
                              <Download size={12} style={{ marginRight: 4 }} /> PDF
                            </button>
                            {isDraft && (
                              <button 
                                className="btn btn--success btn--sm"
                                onClick={() => handleSendInvoice(inv.invoiceNumber, inv.customerName)}
                              >
                                <Send size={12} style={{ marginRight: 4 }} /> Send
                              </button>
                            )}
                            {!isDraft && !isPaid && (
                              <button 
                                className="btn btn--ghost btn--sm"
                                onClick={() => handleSendReminder(inv.invoiceNumber, inv.customerName)}
                                title="Send payment reminder notification"
                              >
                                <Bell size={12} style={{ marginRight: 4 }} /> Reminder
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
        </>
      )}
    </PageContainer>
  )
}


export default ManagementInvoicesPage
