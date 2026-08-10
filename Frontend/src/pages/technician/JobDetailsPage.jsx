import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Wrench } from 'lucide-react'
import PageContainer from '../../components/layout/PageContainer.jsx'

function JobDetailsPage() {
  const navigate = useNavigate()

  return (
    <PageContainer>
      <button className="btn btn--ghost btn--sm" onClick={() => navigate('/technician/jobs')} style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back to Assignments
      </button>

      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        background: 'var(--color-surface)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <Wrench size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: 16 }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>Job Details</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
          This page will show full job details once the Service Requests module is connected to the API.
        </p>
      </div>
    </PageContainer>
  )
}

export default JobDetailsPage
