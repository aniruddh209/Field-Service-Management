// ====================================
// Service Catalog Service
// ====================================
//
// CRUD operations for the service catalog.
// Customers browse; management can add/edit/toggle.
//
// Current: modifies local dummy copy in memory (resets on reload).
// Future:
//   GET    /api/services
//   GET    /api/services/{id}
//   POST   /api/services
//   PUT    /api/services/{id}
//   PATCH  /api/services/{id}/status
//
// ====================================

import { servicesData } from '../data/servicesData.js';

let services = [...servicesData];

/**
 * Fetches all services (active only for customers, all for management).
 * Future: GET /api/services
 */
export async function getServices(includeInactive = false) {
  if (includeInactive) {
    return Promise.resolve([...services]);
  }
  return Promise.resolve(services.filter(s => s.isActive));
}

/**
 * Retrieves a single service.
 * Future: GET /api/services/{id}
 */
export async function getServiceById(id) {
  return Promise.resolve(services.find(s => s.id === Number(id)) || null);
}

/**
 * Filters by category.
 * Future: GET /api/services?category={category}
 */
export async function getServicesByCategory(category) {
  if (!category || category === 'All Services') {
    return Promise.resolve(services.filter(s => s.isActive));
  }
  return Promise.resolve(services.filter(s => s.isActive && s.category === category));
}

/**
 * Creates a new service.
 * Future: POST /api/services
 */
export async function createService(data) {
  const newService = {
    ...data,
    id: Math.max(...services.map(s => s.id), 0) + 1,
    isActive: true,
    whatsIncluded: data.whatsIncluded || []
  };
  services.push(newService);
  return Promise.resolve(newService);
}

/**
 * Updates a service.
 * Future: PUT /api/services/{id}
 */
export async function updateService(id, data) {
  const idx = services.findIndex(s => s.id === Number(id));
  if (idx === -1) return Promise.resolve(null);
  services[idx] = { ...services[idx], ...data };
  return Promise.resolve(services[idx]);
}

/**
 * Toggles active status.
 * Future: PATCH /api/services/{id}/status
 */
export async function toggleServiceActive(id) {
  const idx = services.findIndex(s => s.id === Number(id));
  if (idx === -1) return Promise.resolve(null);
  services[idx] = { ...services[idx], isActive: !services[idx].isActive };
  return Promise.resolve(services[idx]);
}
