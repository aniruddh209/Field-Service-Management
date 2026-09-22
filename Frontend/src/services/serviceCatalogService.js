import api from "../api/api";

export async function getAllServices() {
  const response = await api.get("/Services");
  return response.data?.data || response.data || [];
}

export const getServices = getAllServices;

export async function getAvailableServices() {
  const response = await api.get("/Services/available");
  return response.data?.data || response.data || [];
}

export async function getServiceById(id) {
  const response = await api.get(`/Services/${id}`);
  return response.data?.data || response.data;
}

export async function createService(serviceDto) {
  const response = await api.post("/Services", serviceDto);
  return response.data?.data || response.data;
}

export async function updateService(id, serviceDto) {
  const response = await api.put(`/Services/${id}`, serviceDto);
  return response.data?.data || response.data;
}

export async function deleteService(id) {
  const response = await api.delete(`/Services/${id}`);
  return response.data?.data || response.data;
}

export async function toggleServiceStatus(id) {
  const response = await api.patch(`/Services/${id}/toggle`);
  return response.data?.data || response.data;
}

export const toggleServiceActive = toggleServiceStatus;

const serviceCatalogService = {
  getAllServices,
  getServices,
  getAvailableServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  toggleServiceActive
};

export default serviceCatalogService;

