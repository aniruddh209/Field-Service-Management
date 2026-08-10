import api from "../api/api";

// Get All Services
export const getServices = async () => {
    const response = await api.get("/Services");
    return response.data.data;
};

// Get Service By Id
export const getServiceById = async (id) => {
    const response = await api.get(`/Services/${id}`);
    return response.data.data;
};

// Create Service
export const createService = async (service) => {
    const response = await api.post("/Services", service);
    return response.data.data;
};

// Update Service
export const updateService = async (id, service) => {
    const response = await api.put(`/Services/${id}`, service);
    return response.data;
};

// Delete Service
export const deleteService = async (id) => {
    const response = await api.delete(`/Services/${id}`);
    return response.data;
};

// Toggle Service Active/Inactive
export const toggleServiceActive = async (id) => {
    const response = await api.patch(`/Services/${id}/toggle`);
    return response.data;
};