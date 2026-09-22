import api from "../api/api";

export async function getAllTechnicians() {
  const response = await api.get("/Technicians");
  return response.data?.data || response.data || [];
}

export const getTechnicians = getAllTechnicians;

export async function searchTechnicians(name) {
  const response = await api.get(`/Technicians/search?name=${encodeURIComponent(name)}`);
  return response.data?.data || response.data || [];
}

export async function getTechniciansDropdown() {
  const response = await api.get("/Technicians/dropdown");
  return response.data?.data || response.data || [];
}

export async function getTechnicianDashboard() {
  const response = await api.get("/Technicians/dashboard");
  return response.data?.data || response.data;
}

export async function getTechnicianById(id) {
  const response = await api.get(`/Technicians/${id}`);
  return response.data?.data || response.data;
}

export async function createTechnician(dto) {
  const response = await api.post("/Technicians", dto);
  return response.data?.data || response.data;
}

export async function updateTechnician(id, dto) {
  const response = await api.put(`/Technicians/${id}`, dto);
  return response.data?.data || response.data;
}

export async function toggleTechnicianStatus(id) {
  const response = await api.patch(`/Technicians/${id}/toggle`);
  return response.data?.data || response.data;
}

export const toggleTechnicianActive = toggleTechnicianStatus;

export async function deactivateTechnician(id) {
  const response = await api.patch(`/Technicians/${id}/deactivate`);
  return response.data?.data || response.data;
}

export async function updateWorkStatus(id, newStatus) {
  const statusString = typeof newStatus === 'object' ? (newStatus.status || newStatus.workStatus) : newStatus;
  const response = await api.patch(`/Technicians/${id}/work-status`, { status: statusString });
  return response.data?.data || response.data;
}

export const changeWorkStatus = updateWorkStatus;

export async function updateMyWorkStatus(newStatus) {
  const statusString = typeof newStatus === 'object' ? (newStatus.status || newStatus.workStatus) : newStatus;
  const response = await api.patch("/Technicians/my-status", { status: statusString });
  return response.data?.data || response.data;
}

export const changeMyStatus = updateMyWorkStatus;

const technicianService = {
  getAllTechnicians,
  getTechnicians,
  searchTechnicians,
  getTechniciansDropdown,
  getTechnicianDashboard,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  toggleTechnicianStatus,
  toggleTechnicianActive,
  deactivateTechnician,
  updateWorkStatus,
  changeWorkStatus,
  updateMyWorkStatus,
  changeMyStatus
};

export default technicianService;
