import api from "../api/api";
import { workReportData as initialWorkReports } from "../data/workReportData";

let workReportsList = [...initialWorkReports];

export async function getWorkReportByRequestId(requestId) {
  try {
    const response = await api.get(`/WorkReports/request/${requestId}`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local work reports store:", err.message);
  }

  const report = workReportsList.find(w => w.serviceRequestId === Number(requestId));
  return report || null;
}

export async function approveWorkReport(id) {
  try {
    const response = await api.put(`/WorkReports/${id}/approve`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local work reports store:", err.message);
  }

  workReportsList = workReportsList.map(w => 
    w.id === Number(id) ? { ...w, reviewStatus: 'Approved' } : w
  );
  return workReportsList.find(w => w.id === Number(id));
}

export async function returnWorkReportForCorrection(id, notes) {
  try {
    const response = await api.put(`/WorkReports/${id}/return-correction`, { notes });
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local work reports store:", err.message);
  }

  workReportsList = workReportsList.map(w => 
    w.id === Number(id) ? { ...w, reviewStatus: 'CorrectionRequired', correctionNotes: notes } : w
  );
  return workReportsList.find(w => w.id === Number(id));
}

export async function createWorkReport(reportData) {
  try {
    const response = await api.post("/WorkReports", reportData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local work reports store:", err.message);
  }

  const newId = workReportsList.length ? Math.max(...workReportsList.map(w => w.id)) + 1 : 1;
  const newReport = {
    id: newId,
    reviewStatus: 'PendingReview',
    submittedAt: new Date().toISOString(),
    ...reportData
  };
  workReportsList.push(newReport);
  return newReport;
}
