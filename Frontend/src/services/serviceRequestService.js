import api from "../api/api";

export async function getAllServiceRequests() {
  const response = await api.get("/ServiceRequests");
  return response.data?.data || response.data || [];
}

export async function getMyServiceRequests() {
  const response = await api.get("/ServiceRequests/my");
  return response.data?.data || response.data || [];
}

export const getCustomerRequests = getMyServiceRequests;

export async function getAssignedServiceRequests() {
  const response = await api.get("/ServiceRequests/technician/my");
  return response.data?.data || response.data || [];
}

export const getRequestsByTechnician = getAssignedServiceRequests;

export async function getServiceRequestsByStatus(status) {
  const response = await api.get(`/ServiceRequests/status/${status}`);
  return response.data?.data || response.data || [];
}

export async function searchServiceRequests(name) {
  const response = await api.get(`/ServiceRequests/search?name=${encodeURIComponent(name)}`);
  return response.data?.data || response.data || [];
}

export async function getServiceRequestById(id) {
  const response = await api.get(`/ServiceRequests/${id}`);
  return response.data?.data || response.data;
}

export async function createServiceRequest(dto) {
  const response = await api.post("/ServiceRequests", dto);
  return response.data?.data || response.data;
}

export async function updateServiceRequest(id, dto) {
  const response = await api.put(`/ServiceRequests/${id}`, dto);
  return response.data?.data || response.data;
}

export async function assignTechnician(id, technicianId) {
  const payload = typeof technicianId === 'object' ? technicianId : { technicianId: Number(technicianId) };
  const response = await api.patch(`/ServiceRequests/${id}/assign`, payload);
  return response.data?.data || response.data;
}

export async function startServiceRequest(id) {
  const response = await api.patch(`/ServiceRequests/${id}/start`);
  return response.data?.data || response.data;
}

export async function completeServiceRequest(id) {
  const response = await api.patch(`/ServiceRequests/${id}/complete`);
  return response.data?.data || response.data;
}

export async function cancelServiceRequest(id) {
  const response = await api.patch(`/ServiceRequests/${id}/cancel`);
  return response.data?.data || response.data;
}

export async function getCustomerDashboard() {
  const response = await api.get("/ServiceRequests/dashboard");
  return response.data?.data || response.data;
}

export async function getManagementDashboard() {
  const response = await api.get("/ServiceRequests/management-dashboard");
  return response.data?.data || response.data;
}

export async function getStatusHistory(id) {
  const request = await getServiceRequestById(id);
  return request?.statusHistory || [
    { status: request?.status || "Pending", date: request?.createdAt, updatedBy: "System", notes: "Status updated" }
  ];
}

export async function startReview(id) {
  return startServiceRequest(id);
}

export async function closeRequest(id) {
  return cancelServiceRequest(id);
}

export async function approveWork(requestId) {
  const response = await api.patch(`/WorkReports/${requestId}/approve`);
  return response.data?.data || response.data;
}

export async function returnForCorrection(requestId, reason) {
  const payload = typeof reason === 'object' ? reason : { correctionReason: reason };
  const response = await api.post(`/WorkReports/${requestId}/request-correction`, payload);
  return response.data?.data || response.data;
}

export async function markAsInvoiced(requestId) {
  return true;
}

export async function markAsPaid(invoiceId) {
  const response = await api.patch(`/Invoices/${invoiceId}/status`, JSON.stringify("Paid"), {
    headers: { "Content-Type": "application/json" }
  });
  return response.data?.data || response.data;
}

const serviceRequestService = {
  getAllServiceRequests,
  getMyServiceRequests,
  getCustomerRequests,
  getAssignedServiceRequests,
  getRequestsByTechnician,
  getServiceRequestsByStatus,
  searchServiceRequests,
  getServiceRequestById,
  createServiceRequest,
  updateServiceRequest,
  assignTechnician,
  startServiceRequest,
  completeServiceRequest,
  cancelServiceRequest,
  getCustomerDashboard,
  getManagementDashboard,
  getStatusHistory,
  startReview,
  closeRequest,
  approveWork,
  returnForCorrection,
  markAsInvoiced,
  markAsPaid
};

export default serviceRequestService;
