import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wrench,
  Wind,
  Activity,
  Shield,
  Zap,
  Droplet,
  Search,
  Clock,
  ClipboardList,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react'
import { getServices } from '../../services/serviceCatalogService.js'
import { formatCurrency } from '../../utils/format.js'
import PageContainer from '../../components/layout/PageContainer.jsx'
import './ServicesPage.css'

// Maps string name in mock data to actual Lucide components
const iconMap = {
  Wrench: Wrench,
  Wind: Wind,
  Activity: Activity,
  Shield: Shield,
  Zap: Zap,
  Droplet: Droplet
}

function ServicesPage() {
  const navigate = useNavigate()

  // State Management
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Services')
  const [selectedService, setSelectedService] = useState(null) // Modal details state
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Categories list matching specification
  const categories = [
    'All Services',
    'Air Conditioning',
    'Appliance Repair',
    'Security',
    'Electrical',
    'Plumbing'
  ]

  // Fetch catalog on mount
  useEffect(() => {
    async function loadCatalog() {
      try {
        setIsLoading(true)
        setIsError(false)
        const data = await getServices()
        setServices(data)
        setFilteredServices(data)
      } catch (err) {
        console.error('Error loading service catalog:', err)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadCatalog()
  }, [])

  // Filter logic runs whenever services, searchTerm, or selectedCategory changes
  useEffect(() => {
    let result = services

    // 1. Search term filter (case-insensitive search in name, shortDescription, category)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(term) ||
          (item.shortDescription && item.shortDescription.toLowerCase().includes(term)) ||
          item.category.toLowerCase().includes(term)
      )
    }

    // 2. Category tag filter
    if (selectedCategory !== 'All Services') {
      result = result.filter(item => item.category === selectedCategory)
    }

    setFilteredServices(result)
  }, [services, searchTerm, selectedCategory])

  // Handle booking navigation
  const handleBookService = (service) => {
    // Close modal if open
    setSelectedService(null)
    // Pass selected service object in route state
    navigate('/customer/requests/new', {
      state: { selectedService: service }
    })
  }

  // Clear filters helper
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All Services')
  }

  if (isLoading) {
    return (
      <div className="customer-loading">
        <div className="customer-loading__spinner"></div>
        <p>Loading service catalog...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="customer-error-panel">
        <AlertCircle size={40} className="customer-error-panel__icon" />
        <h3>Unable to load services</h3>
        <p>There was a problem loading our service catalog. Please try again.</p>
        <button
          className="customer-error-panel__btn"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <PageContainer>
      <div className="services-page">
        {/* ---- HEADER SECTION ---- */}
        <div className="services-header">
          <div className="services-header__left">
            <h1 className="services-header__title">Services</h1>
            <p className="services-header__subtitle">
              Choose the service you need and schedule a convenient visit.
            </p>
          </div>
          <div className="services-header__right">
            <button
              className="services-header__btn"
              onClick={() => navigate('/customer/requests')}
            >
              <ClipboardList size={18} />
              My Requests
            </button>
          </div>
        </div>

        {/* ---- SEARCH & CATEGORIES TOOLBAR ---- */}
        <div className="services-toolbar">
          <div className="services-search">
            <Search size={18} className="services-search__icon" />
            <input
              type="text"
              className="services-search__input"
              placeholder="Search services..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              aria-label="Search services"
            />
            {searchTerm && (
              <button
                className="services-search__clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Categories filters list */}
          <div className="services-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`services-filter-pill ${
                  selectedCategory === cat ? 'services-filter-pill--active' : ''
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ---- SERVICES GRID ---- */}
        {filteredServices.length === 0 ? (
          <div className="services-empty">
            <Search size={36} className="services-empty__icon" />
            <h3>No services found</h3>
            <p>Try changing your search or category filter.</p>
            <button className="services-empty__btn" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map(service => {
              const IconComponent = iconMap[service.iconName] || Wrench
              return (
                <div key={service.id} className="service-catalog-card">
                  {service.isPopular && (
                    <span className="service-catalog-card__badge">Popular</span>
                  )}
                  
                  <div className="service-catalog-card__body">
                    <div className="service-catalog-card__icon-wrap">
                      <IconComponent size={20} />
                    </div>
                    <span className="service-catalog-card__category">{service.category}</span>
                    <h3 className="service-catalog-card__title">{service.name}</h3>
                    <p className="service-catalog-card__desc">{service.shortDescription}</p>
                  </div>

                  <div className="service-catalog-card__meta">
                    <div className="service-catalog-card__meta-item">
                      <span>Price starting from</span>
                      <strong>{formatCurrency(service.startingPrice)}</strong>
                    </div>
                    <div className="service-catalog-card__meta-divider" />
                    <div className="service-catalog-card__meta-item">
                      <span>Est. Duration</span>
                      <strong>
                        <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {service.estimatedDurationLabel}
                      </strong>
                    </div>
                  </div>

                  <div className="service-catalog-card__actions">
                    <button
                      className="service-catalog-card__btn-text"
                      onClick={() => setSelectedService(service)}
                    >
                      View Details
                    </button>
                    <button
                      className="service-catalog-card__btn-primary"
                      onClick={() => handleBookService(service)}
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ---- SERVICE DETAILS MODAL ---- */}
        {selectedService && (
          <div className="service-modal-overlay" onClick={() => setSelectedService(null)}>
            <div className="service-modal" onClick={e => e.stopPropagation()}>
              <div className="service-modal__header">
                <div>
                  <span className="service-modal__category">{selectedService.category}</span>
                  <h3 className="service-modal__title">{selectedService.name}</h3>
                </div>
                <button
                  className="service-modal__close"
                  onClick={() => setSelectedService(null)}
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="service-modal__body">
                <p className="service-modal__desc">{selectedService.shortDescription}</p>

                <div className="service-modal__info-row">
                  <div className="service-modal__info-col">
                    <span>Starting Price</span>
                    <strong>{formatCurrency(selectedService.startingPrice)}</strong>
                  </div>
                  <div className="service-modal__info-col">
                    <span>Estimated Duration</span>
                    <strong>{selectedService.estimatedDurationLabel}</strong>
                  </div>
                </div>

                <div className="service-modal__included">
                  <h4>What's Included:</h4>
                  <ul className="service-modal__included-list">
                    {selectedService.whatsIncluded.map((item, index) => (
                      <li key={index} className="service-modal__included-item">
                        <CheckCircle2 size={16} className="service-modal__included-icon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="service-modal__footer">
                <button
                  className="service-modal__btn-secondary"
                  onClick={() => setSelectedService(null)}
                >
                  Cancel
                </button>
                <button
                  className="service-modal__btn-primary"
                  onClick={() => handleBookService(selectedService)}
                >
                  Book Service Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default ServicesPage
