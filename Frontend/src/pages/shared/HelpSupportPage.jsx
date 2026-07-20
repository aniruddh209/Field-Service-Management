import React, { useState } from 'react'
import { LifeBuoy, Send, Check } from 'lucide-react'
import PageContainer from '../../components/layout/PageContainer.jsx'

const FAQS = [
  {
    q: 'How do I request a new field service?',
    a: 'Simply go to your Dashboard or the Browse Services page, choose your service type, click Book / Request, fill in preferred slots, specify address/equipment, and submit the request wizard.'
  },
  {
    q: 'How can I track my technician?',
    a: 'When the technician accepts the assignment and starts traveling, the request status will change to "On The Way". You will see status timeline updates directly under Request Details.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept credit cards, debit cards, UPI payments, and cash on service completion. Invoices are generated once work is completed, which can be viewed in your account.'
  }
]

function HelpSupportPage() {
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    setTicketForm({ subject: '', message: '' })
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">Help & Support</h1>
          <p className="page-header__subtitle">Browse FAQs or contact our customer support team</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* FAQs */}
        <div className="data-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Frequently Asked Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FAQS.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: idx !== FAQS.length - 1 ? '1px solid var(--color-border-light)' : 'none', paddingBottom: 12 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{faq.q}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Ticket */}
        <div className="data-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LifeBuoy size={18} /> Submit Support Ticket
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            Have a specific issue? Write to us, and our team will get back to you shortly.
          </p>

          {submitted && (
            <div style={{
              background: 'var(--color-success-light)', color: 'var(--color-success)',
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6
            }}>
              <Check size={16} /> Ticket submitted successfully (demo)!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                value={ticketForm.subject}
                onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                placeholder="e.g. Trouble adding address"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Message / Details</label>
              <textarea
                className="form-textarea"
                value={ticketForm.message}
                onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                placeholder="Describe your issue..."
                rows={4}
                required
              />
            </div>
            <button type="submit" className="btn btn--primary" style={{ marginTop: 12 }}>
              <Send size={14} /> Send Ticket
            </button>
          </form>
        </div>
      </div>
    </PageContainer>
  )
}

export default HelpSupportPage
