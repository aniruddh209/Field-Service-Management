import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function PaginationControls({ pageNumber = 1, pageSize = 10, totalCount = 0, totalPages = 1, onPageChange, onPageSizeChange }) {
  if (totalCount === 0) return null

  const startRecord = (pageNumber - 1) * pageSize + 1
  const endRecord = Math.min(pageNumber * pageSize, totalCount)

  return (
    <div className="pagination-bar" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      flexWrap: 'wrap', gap: 12, fontSize: '0.84rem', color: 'var(--color-text-secondary)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>
          Showing <strong>{startRecord}</strong>–<strong>{endRecord}</strong> of <strong>{totalCount}</strong> items
        </span>
        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.82rem'
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          className="btn btn--ghost btn--sm"
          disabled={pageNumber <= 1}
          onClick={() => onPageChange(pageNumber - 1)}
          style={{ padding: '4px 8px' }}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <span style={{ fontWeight: 600, color: 'var(--color-text)', padding: '0 8px' }}>
          Page {pageNumber} of {totalPages || 1}
        </span>

        <button
          className="btn btn--ghost btn--sm"
          disabled={pageNumber >= totalPages}
          onClick={() => onPageChange(pageNumber + 1)}
          style={{ padding: '4px 8px' }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default PaginationControls
