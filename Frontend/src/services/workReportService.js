import api from "../api/api";

export async function getAllWorkReports() {
  const response = await api.get("/WorkReports");
  return response.data?.data || response.data || [];
}

export async function getMyWorkReports() {
  const response = await api.get("/WorkReports/technician/my");
  return response.data?.data || response.data || [];
}

export async function getWorkReportById(id) {
  const response = await api.get(`/WorkReports/${id}`);
  return response.data?.data || response.data;
}

export async function getWorkReportByServiceRequestId(serviceRequestId) {
  const response = await api.get(`/WorkReports/service-request/${serviceRequestId}`);
  return response.data?.data || response.data;
}

export const getWorkReportByRequestId = getWorkReportByServiceRequestId;

export async function getWorkReportsByStatus(status) {
  const response = await api.get(`/WorkReports/status/${status}`);
  return response.data?.data || response.data || [];
}

export async function createWorkReport(dto) {
  const response = await api.post("/WorkReports", dto);
  return response.data?.data || response.data;
}

export async function updateWorkReport(id, dto) {
  const response = await api.put(`/WorkReports/${id}`, dto);
  return response.data?.data || response.data;
}

export async function approveWorkReport(id) {
  const response = await api.patch(`/WorkReports/${id}/approve`);
  return response.data?.data || response.data;
}

export async function requestCorrectionForWorkReport(id, reason) {
  const payload = typeof reason === 'object' ? reason : { correctionReason: reason };
  const response = await api.post(`/WorkReports/${id}/request-correction`, payload);
  return response.data?.data || response.data;
}

export const returnWorkReportForCorrection = requestCorrectionForWorkReport;

export async function addWorkReportPart(workReportId, dto) {
  const response = await api.post(`/WorkReports/${workReportId}/parts`, dto);
  return response.data?.data || response.data;
}

export async function removeWorkReportPart(workReportId, partId) {
  const response = await api.delete(`/WorkReports/${workReportId}/parts/${partId}`);
  return response.data;
}

export async function getWorkReportsDashboard() {
  const response = await api.get("/WorkReports/management-dashboard");
  return response.data?.data || response.data;
}

const workReportService = {
  getAllWorkReports,
  getMyWorkReports,
  getWorkReportById,
  getWorkReportByServiceRequestId,
  getWorkReportByRequestId,
  getWorkReportsByStatus,
  createWorkReport,
  updateWorkReport,
  approveWorkReport,
  requestCorrectionForWorkReport,
  returnWorkReportForCorrection,
  addWorkReportPart,
  removeWorkReportPart,
  getWorkReportsDashboard
};

export default workReportService;
