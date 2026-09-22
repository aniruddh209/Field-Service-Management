import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Search,
  Clock,
  AlertCircle
} from "lucide-react";

import { getServices, getAvailableServices } from "../../services/serviceCatalogService";
import { formatCurrency } from "../../utils/format";
import PageContainer from "../../components/layout/PageContainer";
import { LoadingState, EmptyState } from "../../components/ui/PageStates";
import Modal from "../../components/ui/Modal";
import "./ServicesPage.css";

function ServicesPage() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const categories = [
    "All Services",
    "Cooling",
    "Appliances",
    "Plumbing",
    "Electrical",
    "Security"
  ];

  useEffect(() => {
    loadCatalog();
  }, []);

  async function loadCatalog() {
    try {
      setIsLoading(true);
      setIsError(false);
      let data;
      try {
        data = await getAvailableServices();
      } catch {
        data = await getServices();
      }
      const activeServices = (data || []).filter(service => service.isActive !== false);
      setServices(activeServices);
      setFilteredServices(activeServices);
    } catch (err) {
      console.error("Failed to load service catalog:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let result = [...services];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(service =>
        (service.serviceName || service.name || '')
          .toLowerCase()
          .includes(term)
        ||
        (service.category || '')
          .toLowerCase()
          .includes(term)
        ||
        (
          service.description &&
          service.description
            .toLowerCase()
            .includes(term)
        )
      );
    }

    if (selectedCategory !== "All Services") {
      result = result.filter(
        service => (service.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredServices(result);
  }, [services, searchTerm, selectedCategory]);

  function handleBookService(service) {
    setSelectedService(null);
    navigate(`/customer/requests/new?serviceId=${service.id}`, {
      state: {
        selectedService: service
      }
    });
  }

  function handleClearFilters() {
    setSearchTerm("");
    setSelectedCategory("All Services");
  }

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading service catalog..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-header__info">
          <h1 className="page-header__title">Browse Service Catalog</h1>
          <p className="page-header__subtitle">Explore available maintenance, repair, and field services</p>
        </div>
      </div>

      {isError ? (
        <div className="customer-error-panel" style={{ padding: '32px 20px', background: 'var(--color-surface)', borderRadius: 12, textAlign: 'center', border: '1px solid var(--color-border)' }}>
          <AlertCircle size={40} style={{ color: 'var(--color-danger)', marginBottom: 12 }} />
          <h3>Unable to load services</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>There was a connection issue loading the catalog.</p>
          <button className="btn btn--primary" onClick={loadCatalog}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Search & Category Filter Bar */}
          <div className="filters-bar" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="filters-bar__search" style={{ width: '100%', maxWidth: 450 }}>
              <Search size={16} className="filters-bar__search-icon" />
              <input
                className="filters-bar__search-input"
                placeholder="Search services by name, category, or description..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 600 : 400,
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: isSelected ? '#fff' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No services available"
              message={searchTerm || selectedCategory !== "All Services" ? "No services match your search criteria. Try adjusting your filters." : "No services are currently available in the catalog."}
              actionLabel={searchTerm || selectedCategory !== "All Services" ? "Clear Filters" : undefined}
              onAction={searchTerm || selectedCategory !== "All Services" ? handleClearFilters : undefined}
            />
          ) : (
            <div className="services-grid">
              {filteredServices.map((service) => (
                <div key={service.id} className="service-catalog-card">
                  <div className="service-catalog-card__body">
                    <div className="service-catalog-card__icon-wrap">
                      <Wrench size={22} />
                    </div>
                    <span className="service-catalog-card__category">
                      {service.category}
                    </span>
                    <h3 className="service-catalog-card__title">
                      {service.serviceName || service.name}
                    </h3>
                    <p className="service-catalog-card__desc">
                      {service.description}
                    </p>
                  </div>

                  <div className="service-catalog-card__meta">
                    <div className="service-catalog-card__meta-item">
                      <span>Starting Price</span>
                      <strong>
                        {formatCurrency(service.basePrice || service.price || 0)}
                      </strong>
                    </div>

                    <div className="service-catalog-card__meta-divider" />

                    <div className="service-catalog-card__meta-item">
                      <span>Estimated Time</span>
                      <strong>
                        <Clock size={12} style={{ marginRight: 5, verticalAlign: "middle" }} />
                        {service.estimatedHours} {service.estimatedHours === 1 ? 'Hour' : 'Hours'}
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
              ))}
            </div>
          )}
        </>
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <Modal
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          title={selectedService.serviceName || selectedService.name}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <span className="badge badge--completed" style={{ marginBottom: 8, display: 'inline-block' }}>
                {selectedService.category}
              </span>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {selectedService.description}
              </p>
            </div>

            <div style={{ padding: 14, background: 'var(--color-surface-hover)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', display: 'block' }}>Base Price</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                  {formatCurrency(selectedService.basePrice || selectedService.price || 0)}
                </strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', display: 'block' }}>Estimated Duration</span>
                <strong style={{ fontSize: '1rem', color: 'var(--color-text)' }}>
                  {selectedService.estimatedHours} {selectedService.estimatedHours === 1 ? 'Hour' : 'Hours'}
                </strong>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn--outline" onClick={() => setSelectedService(null)}>
                Close
              </button>
              <button className="btn btn--primary" onClick={() => handleBookService(selectedService)}>
                Book This Service
              </button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}

export default ServicesPage;
