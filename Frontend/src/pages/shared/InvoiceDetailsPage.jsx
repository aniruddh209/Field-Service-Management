import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, CheckCircle, Clock, AlertTriangle, ShieldCheck, Download } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getInvoiceById, payInvoice, downloadInvoicePdf } from '../../services/invoiceService.js'
import { markAsPaid } from '../../services/serviceRequestService.js'
import { formatCurrency, formatDate } from '../../utils/format.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { LoadingState, ErrorState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

function InvoiceDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [invoice, setInvoice] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Payment dialog states
  const [showPayModal, setShowPayModal] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [successToast, setSuccessToast] = useState('')

  async function load() {
    try {
      setIsLoading(true)
      const data = await getInvoiceById(id)
      if (!data) { setIsError(true); return }
      
      // Customer privacy check: customers can only view their own invoices
      if (user?.role === 'Customer' && data.customerId !== user?.id) { 
        setIsError(true)
        return 
      }
      setInvoice(data)
    } catch (err) {
      console.error(err)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id, user])

  const handleSimulatePayment = async () => {
    setIsPaying(true)
    try {
      // 1. Mark invoice as Paid in invoiceService
      await payInvoice(invoice.id)

      // 2. Mark service request as Paid in serviceRequestService
      await markAsPaid(invoice.serviceRequestId, user.id)

      setIsPaying(false)
      setShowPayModal(false)
      
      setSuccessToast('Payment successfully simulated! Status updated to Paid.')
      setTimeout(() => setSuccessToast(''), 4000)
      
      // Reload details
      load()
    } catch (err) {
      console.error(err)
      setIsPaying(false)
    }
  }

  if (isLoading) return <PageContainer><LoadingState message="Loading invoice details..." /></PageContainer>
  if (isError || !invoice) return <PageContainer><ErrorState message="Invoice not found." onRetry={() => navigate(-1)} /></PageContainer>

  const isCustomer = user?.role === 'Customer'
  const backPath = isCustomer ? '/customer/invoices' : '/management/invoices'
  const isUnpaid = invoice.status !== 'Paid'

  return (
    <PageContainer>
      {/* Toast Notification */}
      {successToast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          background: 'var(--color-success)', color: 'white',
          padding: '12px 24px', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--dropdown-shadow)', fontSize: '0.88rem',
          fontWeight: 600, animation: 'fadeIn 0.2s ease'
        }}>
          {successToast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(backPath)}>
          <ArrowLeft size={16} /> Back to Invoices
        </button>

        <button className="btn btn--primary btn--sm" onClick={() => downloadInvoicePdf(invoice.id, invoice.invoiceNumber)}>
          <Download size={14} style={{ marginRight: 6 }} /> Download Invoice (PDF)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, maxWidth: 800, margin: '0 auto' }}>

        
        {/* Payment callout alert */}
        {isCustomer && isUnpaid && (
          <div style={{
            padding: '16px 20px', background: 'var(--color-warning-light)',
            border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-lg)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Clock size={20} style={{ color: 'var(--color-warning)' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem' }}>Payment is Pending</p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Due date: {formatDate(invoice.dueDate)}</p>
              </div>
            </div>
            <button className="btn btn--primary btn--sm" onClick={() => setShowPayModal(true)}>
              <CreditCard size={14} style={{ marginRight: 6 }} /> Pay Now
            </button>
          </div>
        )}

        {invoice.status === 'Paid' && (
          <div style={{
            padding: '16px 20px', background: 'var(--color-success-light)',
            border: '1px solid var(--color-success)', borderRadius: 'var(--radius-lg)',
            display: 'flex', gap: 10, alignItems: 'center'
          }}>
            <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-success)' }}>Payment Confirmed</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Paid on: {formatDate(invoice.paidAt || invoice.issuedAt)}</p>
            </div>
          </div>
        )}

        {/* Invoice Container Sheet */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-border)', paddingBottom: 20, marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>FIELD SERVICE</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', margin: '2px 0 0 0' }}>Professional Maintenance & Repairs</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>INVOICE</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Number: <strong>{invoice.invoiceNumber}</strong></p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, fontSize: '0.88rem', marginBottom: 24 }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--color-text-tertiary)', margin: '0 0 4px 0', textTransform: 'uppercase', fontSize: '0.75rem' }}>Bill To</p>
              <p style={{ fontWeight: 700, margin: '0 0 2px 0' }}>{invoice.customerName || 'Customer'}</p>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Field Service Customer</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, color: 'var(--color-text-tertiary)', margin: '0 0 4px 0', textTransform: 'uppercase', fontSize: '0.75rem' }}>Details</p>
              <p style={{ margin: '0 0 2px 0' }}>Request ID: <strong>{invoice.requestNumber || (invoice.serviceRequestId ? `SR-${String(invoice.serviceRequestId).padStart(4, '0')}` : 'N/A')}</strong></p>
              <p style={{ margin: '0 0 2px 0' }}>Service: {invoice.serviceName || 'Service'}</p>
              <p style={{ margin: '0 0 2px 0' }}>Issued: {formatDate(invoice.issuedAt)}</p>
              <p style={{ margin: 0 }}>Due Date: <strong>{formatDate(invoice.dueDate || (invoice.issuedAt ? new Date(new Date(invoice.issuedAt).getTime() + 7*24*60*60*1000).toISOString() : null))}</strong></p>
            </div>
          </div>

          {/* Charges details table */}
          <div className="data-table-wrap" style={{ marginBottom: 24 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Service fee */}
                <tr>
                  <td>{invoice.serviceName || 'Base'} Service Fee</td>
                  <td>1</td>
                  <td>{formatCurrency(invoice.serviceAmount ?? 500)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.serviceAmount ?? 500)}</td>
                </tr>
                {/* Labour */}
                {(invoice.labourCharge > 0) && (
                  <tr>
                    <td>Service Labour Operations</td>
                    <td>1</td>
                    <td>{formatCurrency(invoice.labourCharge)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.labourCharge)}</td>
                  </tr>
                )}
                {/* Items / Parts */}
                {(invoice.items || invoice.parts || []).map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.itemName || p.partName || p.name || 'Inventory Item'}</td>
                    <td>{p.quantity || 1}</td>
                    <td>{formatCurrency(p.unitPrice || 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(p.totalPrice || (p.quantity || 1) * (p.unitPrice || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown block */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.88rem', marginBottom: 24 }}>
            <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal:</span>
                <span>{formatCurrency(invoice.subTotal || ((invoice.serviceAmount ?? 500) + (invoice.labourCharge || 0) + (invoice.partsAmount || 0)))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Tax (GST):</span>
                <span>{formatCurrency(invoice.taxAmount || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, borderTop: '2px solid var(--color-border)', paddingTop: 8, color: 'var(--color-primary)' }}>
                <span>Grand Total:</span>
                <span>{formatCurrency(invoice.totalAmount || 0)}</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-tertiary)', borderTop: '1px solid var(--color-border-light)', paddingTop: 12 }}>
            <p style={{ margin: '0 0 4px 0' }}>Notes: {invoice.notes || 'Thank you for choosing Field Service.'}</p>
            <p style={{ margin: 0 }}>Due Date: {formatDate(invoice.dueDate || (invoice.issuedAt ? new Date(new Date(invoice.issuedAt).getTime() + 7*24*60*60*1000).toISOString() : null))}</p>
          </div>

        </div>

      </div>

      {/* Payment simulation modal */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Payment Summary" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 16, background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 8 }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Invoice Number:</span>
              <span style={{ fontWeight: 600 }}>{invoice.invoiceNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 8 }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Service Type:</span>
              <span>{invoice.serviceName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, borderTop: '1px solid var(--color-border-light)', paddingTop: 8, marginTop: 8 }}>
              <span>Total Amount:</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', margin: 0 }}>
            * This is a simulated checkout session. No real banking details are required or charged.
          </p>

          <div className="form-actions">
            <button className="btn btn--outline" onClick={() => setShowPayModal(false)} disabled={isPaying}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={handleSimulatePayment} disabled={isPaying}>
              {isPaying ? 'Processing...' : 'Simulate Payment'}
            </button>
          </div>
        </div>
      </Modal>

    </PageContainer>
  )
}

export default InvoiceDetailsPage
