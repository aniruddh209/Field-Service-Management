import api from "../api/api";
import { servicesData as initialServices } from "../data/servicesData";

let servicesList = [...initialServices];

export async function getServices() {
  try {
    const response = await api.get("/Services");
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local services store:", err.message);
  }
  return servicesList;
}

export async function createService(serviceData) {
  try {
    const response = await api.post("/Services", serviceData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local services store:", err.message);
  }

  const newService = {
    id: servicesList.length ? Math.max(...servicesList.map(s => s.id)) + 1 : 1,
    isActive: true,
    isPopular: false,
    whatsIncluded: [],
    ...serviceData
  };
  servicesList.push(newService);
  return newService;
}

export async function updateService(id, serviceData) {
  try {
    const response = await api.put(`/Services/${id}`, serviceData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local services store:", err.message);
  }

  servicesList = servicesList.map(s => s.id === Number(id) ? { ...s, ...serviceData } : s);
  return servicesList.find(s => s.id === Number(id));
}

export async function toggleServiceActive(id) {
  try {
    const response = await api.put(`/Services/${id}/toggle-active`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local services store:", err.message);
  }

  servicesList = servicesList.map(s => 
    s.id === Number(id) ? { ...s, isActive: !s.isActive } : s
  );
  return servicesList.find(s => s.id === Number(id));
}
