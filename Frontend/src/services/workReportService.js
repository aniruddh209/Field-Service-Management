// ====================================
// Work Report Service
// ====================================
//
// Manages creation, retrieval, and status updates of technician completion reports.
//
// Current: modifies local dummy copy in memory.
// Future:
//   GET  /api/service-requests/{requestId}/completion-report
//   POST /api/service-requests/{requestId}/completion-report
//   PATCH /api/completion-reports/{id}/approve
//   PATCH /api/completion-reports/{id}/return-for-correction
//
// ====================================

import { workReportData } from '../data/workReportData.js';

let reports = [...workReportData];

/**
 * Retrieves the completion report associated with a service request.
 * @param {number|string} requestId
 */
export async function getWorkReportByRequestId(requestId) {
  const report = reports.find(r => r.serviceRequestId === Number(requestId));
  return Promise.resolve(report || null);
}

/**
 * Submits or resubmits a technician completion report.
 * If report already exists (e.g. resubmitting after correction), updates it.
 */
export async function submitWorkReport(requestId, reportData, technicianId, technicianName) {
  // Remove existing report to support overwriting on correction/resubmission
  reports = reports.filter(r => r.serviceRequestId !== Number(requestId));

  const newReport = {
    id: Math.max(...reports.map(r => r.id), 0) + 1,
    serviceRequestId: Number(requestId),
    technicianId: Number(technicianId),
    technicianName,
    ...reportData,
    submittedAt: new Date().toISOString(),
    reviewStatus: 'PendingReview',
    correctionNotes: ''
  };

  reports.push(newReport);
  return Promise.resolve(newReport);
}

/**
 * Approves a technician report.
 */
export async function approveWorkReport(requestId) {
  const report = reports.find(r => r.serviceRequestId === Number(requestId));
  if (report) {
    report.reviewStatus = 'Approved';
    report.correctionNotes = '';
  }
  return Promise.resolve(report || null);
}

/**
 * Returns a technician report for correction.
 */
export async function returnWorkReportForCorrection(requestId, reason) {
  const report = reports.find(r => r.serviceRequestId === Number(requestId));
  if (report) {
    report.reviewStatus = 'CorrectionRequired';
    report.correctionNotes = reason;
  }
  return Promise.resolve(report || null);
}
