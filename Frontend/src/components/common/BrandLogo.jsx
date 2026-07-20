import { Wrench } from 'lucide-react'

function BrandLogo({ collapsed = false }) {
  return (
    <div className="brand-logo">
      <div className="brand-logo__icon">
        <Wrench size={22} />
      </div>
      {!collapsed && (
        <div className="brand-logo__text">
          <span className="brand-logo__name">Field Service</span>
          <span className="brand-logo__tagline">Service Operations</span>
        </div>
      )}
    </div>
  )
}

export default BrandLogo
