import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Search,
  Clock,
  ClipboardList,
  X,
  AlertCircle
} from "lucide-react";

import { getServices } from "../../services/serviceCatalogService";
import { formatCurrency } from "../../utils/format";
import PageContainer from "../../components/layout/PageContainer";
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
      const data = await getServices();
      const activeServices = data.filter(service => service.isActive);
      setServices(activeServices);
      setFilteredServices(activeServices);
    } catch (err) {
      console.error(err);
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
        service => service.category === selectedCategory
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
      <div className="customer-loading">
        <div className="customer-loading__spinner" />
        <p>Loading Services...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="customer-error-panel">
        <AlertCircle size={40} className="customer-error-panel__icon" />
        <h3>Unable to load services</h3>
        <p>Please try again.</p>
        <button className="customer-error-panel__btn" onClick={loadCatalog}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <PageContainer>
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
                  {service.estimatedHours} Hours
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
    </PageContainer>
  );
}

export default ServicesPage;
