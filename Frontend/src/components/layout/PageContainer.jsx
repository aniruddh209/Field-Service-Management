import React from 'react'

/**
 * Standard page container enforcing uniform spacing,
 * responsive paddings, and alignment metrics across routes.
 */
function PageContainer({ children, className = '' }) {
  return (
    <div className={`page-container ${className}`}>
      {children}
    </div>
  )
}

export default PageContainer
