import React from 'react'
import { ClipboardList } from 'lucide-react'
import PageContainer from '../../components/layout/PageContainer.jsx'

function JobHistoryPage() {
  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">Job History</h1>
          <p className="page-header__subtitle">Review your past completed jobs</p>
        </div>
      </div>

      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        background: 'var(--color-surface)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <ClipboardList size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: 16 }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No Job History Yet</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
          Job history will appear here once the Service Requests module is connected to the API.
        </p>
      </div>
    </PageContainer>
  )
}

export default JobHistoryPage
