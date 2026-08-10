import api from "../api/api";

// Get All Technicians
export const getTechnicians = async () => {
    const response = await api.get("/Technicians");
    return response.data.data;
};

// Get Technician By Id
export const getTechnicianById = async (id) => {
    const response = await api.get(`/Technicians/${id}`);
    return response.data.data;
};

// Get Technician By UserId (client-side filter — backend has no /user/{id} endpoint)
export const getTechnicianByUserId = async (userId) => {
    const all = await getTechnicians();
    return all.find(t => t.userId === Number(userId)) || null;
};

// Create Technician
export const createTechnician = async (technician) => {
    const response = await api.post("/Technicians", technician);
    return response.data.data;
};

// Update Technician
export const updateTechnician = async (id, technician) => {
    const response = await api.put(`/Technicians/${id}`, technician);
    return response.data;
};

// Delete Technician
export const deleteTechnician = async (id) => {
    const response = await api.delete(`/Technicians/${id}`);
    return response.data;
};

// Toggle Technician Active/Inactive
export const toggleTechnicianActive = async (id) => {
    const response = await api.patch(`/Technicians/${id}/toggle`);
    return response.data;
};

// Change Work Status (Available / Busy / On Leave)
export const changeWorkStatus = async (id, status) => {
    const response = await api.patch(
        `/Technicians/${id}/work-status`,
        JSON.stringify(status),
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
    return response.data;
};

// Search Technicians by name
export const searchTechnicians = async (name) => {
    const response = await api.get(
        `/Technicians/search?name=${encodeURIComponent(name)}`
    );
    return response.data.data;
};