// ====================================
// Service Request Service
// ====================================
//
// Operations on service requests for all roles.
//
// Current: modifies local dummy copy in memory (resets on reload).
// Future:
//   GET    /api/service-requests/my           — customer's own requests (JWT)
//   GET    /api/service-requests              — all requests (management)
//   GET    /api/service-requests/{id}
//   POST   /api/service-requests
//   PATCH  /api/service-requests/{id}/review
//   PATCH  /api/service-requests/{id}/assign
//   PATCH  /api/service-requests/{id}/accept
//   PATCH  /api/service-requests/{id}/reject-assignment
//   PATCH  /api/service-requests/{id}/on-the-way
//   PATCH  /api/service-requests/{id}/start
//   PATCH  /api/service-requests/{id}/complete
//
// IMPORTANT — Future Security Note:
// "My" endpoints use JWT claims for user identity on the backend.
// The frontend passes customerId only for demo filtering.
//
// ====================================

import { serviceRequestsData } from '../data/serviceRequestsData.js';
import { statusHistoryData } from '../data/statusHistoryData.js';
import { techniciansData } from '../data/techniciansData.js';
import { createNotification } from './notificationService.js';

let requests = [...serviceRequestsData];
let history = [...statusHistoryData];

// ---- Helper to add status history entry ----
function addHistoryEntry(serviceRequestId, status, changedByUserId, note) {
  const entry = {
    id: Math.max(...history.map(h => h.id), 0) + 1,
    serviceRequestId,
    status,
    changedAt: new Date().toISOString(),
    changedByUserId,
    note
  };
  history.push(entry);
  return entry;
}

// ====================================
// READ operations
// ====================================

/**
 * Fetches all requests for a customer.
 * Future: GET /api/service-requests/my
 */
export async function getMyServiceRequests(customerId) {
  return Promise.resolve(
    requests.filter(r => r.customerId === customerId)
      .sort((a, b) => b.id - a.id)
  );
}

/**
 * Fetches ALL requests (for management view).
 * Future: GET /api/service-requests
 */
export async function getAllServiceRequests() {
  return Promise.resolve(
    [...requests].sort((a, b) => b.id - a.id)
  );
}

/**
 * Retrieves a single service request.
 * Future: GET /api/service-requests/{id}
 */
export async function getServiceRequestById(id) {
  return Promise.resolve(requests.find(r => r.id === Number(id)) || null);
}

/**
 * Filters active requests for a customer.
 * Future: GET /api/service-requests/my?status=active
 */
export async function getActiveRequestsByCustomer(customerId) {
  const activeStatuses = ['Pending', 'UnderReview', 'Assigned', 'Accepted', 'OnTheWay', 'InProgress'];
  return Promise.resolve(
    requests.filter(r => r.customerId === customerId && activeStatuses.includes(r.status))
  );
}

/**
 * Fetches requests assigned to a specific technician.
 * Future: GET /api/technicians/me/jobs (backend gets tech ID from JWT)
 */
export async function getRequestsByTechnician(technicianId) {
  return Promise.resolve(
    requests.filter(r => r.assignedTechnicianId === technicianId)
      .sort((a, b) => b.id - a.id)
  );
}

/**
 * Fetches status history for a request.
 * Future: GET /api/service-requests/{id}/history
 */
export async function getStatusHistory(serviceRequestId) {
  return Promise.resolve(
    history
      .filter(h => h.serviceRequestId === Number(serviceRequestId))
      .sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt))
  );
}

// ====================================
// CREATE
// ====================================

/**
 * Creates a new service request.
 * Future: POST /api/service-requests
 */
export async function createServiceRequest(data) {
  const newId = Math.max(...requests.map(r => r.id), 0) + 1;
  const newRequest = {
    ...data,
    id: newId,
    requestNumber: `SR-${String(newId).padStart(4, '0')}`,
    status: 'Pending',
    assignedTechnicianId: null,
    assignedTechnicianName: null,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  requests.push(newRequest);
  addHistoryEntry(newId, 'Pending', data.customerId, 'Request created by customer');
  return Promise.resolve(newRequest);
}

// ====================================
// ====================================
// STATUS TRANSITIONS
// ====================================

/**
 * Moves request from Pending → UnderReview.
 * Future: PATCH /api/service-requests/{id}/review
 */
export async function startReview(requestId, userId) {
  const req = requests.find(r => r.id === Number(requestId));
  if (!req || req.status !== 'Pending') return Promise.resolve(null);
  req.status = 'UnderReview';
  addHistoryEntry(req.id, 'UnderReview', userId, 'Review started by management');
  return Promise.resolve({ ...req });
}

/**
 * Assigns a technician to a request. Status → Assigned.
 * Future: PATCH /api/service-requests/{id}/assign
 */
export async function assignTechnician(requestId, technicianId, technicianName, userId) {
  const req = requests.find(r => r.id === Number(requestId));
  if (!req) return Promise.resolve(null);
  req.status = 'Assigned';
  req.assignedTechnicianId = Number(technicianId);
  req.assignedTechnicianName = technicianName;
  addHistoryEntry(req.id, 'Assigned', userId, `Assigned to ${technicianName}`);

  // Notify technician (Ravi Kumar maps to userId 4)
  const tech = techniciansData.find(t => t.id === Number(technicianId));
  if (tech && tech.userId) {
    await createNotification({
      userId: tech.userId,
      title: 'New job assigned',
      message: `You have been assigned to ${req.requestNumber} — ${req.serviceName} for ${req.customerName}.`,
      type: 'Assignment',
      relatedEntityType: 'ServiceRequest',
      relatedEntityId: req.id
    });
  }

  return Promise.resolve({ ...req });
}

/**
 * Technician accepts the job. Status → Accepted.
 * Future: PATCH /api/service-requests/{id}/accept
 */
export async function acceptJob(requestId, userId) {
  const req = requests.find(r => r.id === Number(requestId));
  if (!req || req.status !== 'Assigned') return Promise.resolve(null);
  req.status = 'Accepted';
  addHistoryEntry(req.id, 'Accepted', userId, 'Technician accepted the job');

  // Notify customer
  await createNotification({
    userId: req.customerId,
    title: 'Job accepted',
    message: `Technician ${req.assignedTechnicianName} has accepted your job request.`,
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: req.id
  });

  // Notify Manager/Owner
  const m = `${req.assignedTechnicianName} accepted job ${req.requestNumber}`;
  await createNotification({ userId: 2, title: 'Job accepted', message: m, type: 'Request', relatedEntityType: 'ServiceRequest', relatedEntityId: req.id });
  await createNotification({ userId: 3, title: 'Job accepted', message: m, type: 'Request', relatedEntityType: 'ServiceRequest', relatedEntityId: req.id });

  return Promise.resolve({ ...req });
}

/**
 * Technician rejects the assignment. Request stays for reassignment.
 * Future: PATCH /api/service-requests/{id}/reject-assignment
 */
export async function rejectAssignment(requestId, userId, reason) {
  const req = requests.find(r => r.id === Number(requestId));
  if (!req || req.status !== 'Assigned') return Promise.resolve(null);
  // Request goes back to UnderReview for reassignment
  req.status = 'UnderReview';
  const prevTech = req.assignedTechnicianName;
  req.assignedTechnicianId = null;
  req.assignedTechnicianName = null;
  addHistoryEntry(req.id, 'UnderReview', userId, `Assignment rejected by ${prevTech}: ${reason}`);

  // Notify Manager/Owner
  const m = `${prevTech} rejected assignment ${req.requestNumber}: "${reason}"`;
  await createNotification({ userId: 2, title: 'Assignment rejected', message: m, type: 'Request', relatedEntityType: 'ServiceRequest', relatedEntityId: req.id });
  await createNotification({ userId: 3, title: 'Assignment rejected', message: m, type: 'Request', relatedEntityType: 'ServiceRequest', relatedEntityId: req.id });

  return Promise.resolve({ ...req });
}

/**
 * Technician starts travel. Status → OnTheWay.
 * Future: PATCH /api/service-requests/{id}/on-the-way
 */
export async function startTravel(requestId, userId) {
  const req = requests.find(r => r.id === Number(requestId));
  if (!req || req.status !== 'Accepted') return Promise.resolve(null);
  req.status = 'OnTheWay';
  addHistoryEntry(req.id, 'OnTheWay', userId, 'Technician is on the way');

  // Notify customer
  await createNotification({
    userId: req.customerId,
    title: 'Technician on the way',
    message: `Technician ${req.assignedTechnicianName} is on the way for your request ${req.requestNumber}.`,
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: req.id
  });

  return Promise.resolve({ ...req });
}

/**
 * Technician starts work. Status → InProgress.
 * Future: PATCH /api/service-requests/{id}/start
 */
export async function startWork(requestId, userId) {
  const req = requests.find(r => r.id === Number(requestId));
  if (!req || req.status !== 'OnTheWay') return Promise.resolve(null);
  req.status = 'InProgress';
  addHistoryEntry(req.id, 'InProgress', userId, 'Work started at customer location');

  // Notify customer
  await createNotification({
    userId: req.customerId,
    title: 'Work started',
    message: `Work has started on your request ${req.requestNumber}.`,
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: req.id
  });

  return Promise.resolve({ ...req });
}

/**
 * Technician completes the job. Status → WorkCompleted.
 * Future: PATCH /api/service-requests/{id}/complete
 */
export async function completeJob(requestId, userId, completionData) {
  const req = requests.find(r => r.id === Number(requestId));
  if (!req || (req.status !== 'InProgress' && req.status !== 'WorkCompleted')) return Promise.resolve(null);
  req.status = 'WorkCompleted';
  
  if (completionData) {
    req.diagnosis = completionData.diagnosis;
    req.workPerformed = completionData.workPerformed;
    req.resolution = completionData.resolution;
    req.partsUsed = completionData.partsUsed;
  }
  
  addHistoryEntry(req.id, 'WorkCompleted', userId, 'Technician submitted completion report');

  // Notify Customer
  await createNotification({
    userId: req.customerId,
    title: 'Work completed',
    message: `Technician has submitted the completion report for ${req.requestNumber} — awaiting final review.`,
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: req.id
  });

  // Notify Manager/Owner
  const m = `${req.assignedTechnicianName} submitted completion report for ${req.requestNumber}`;
  await createNotification({ userId: 2, title: 'Work report submitted', message: m, type: 'Request', relatedEntityType: 'ServiceRequest', relatedEntityId: req.id });
  await createNotification({ userId: 3, title: 'Work report submitted', message: m, type: 'Request', relatedEntityType: 'ServiceRequest', relatedEntityId: req.id });

  return Promise.resolve({ ...req });
}

/**
 * Manager approves completion report. Status → Completed.
 */
export async function approveWork(requestId, userId) {
  const req = requests.find(r => r.id === Number(requestId));
  if (!req || req.status !== 'WorkCompleted') return Promise.resolve(null);
  req.status = 'Completed';
  req.completedAt = new Date().toISOString();

  addHistoryEntry(req.id, 'Completed', userId, 'Completion report approved by management');

  // Notify Technician
  const tech = techniciansData.find(t => t.id === req.assignedTechnicianId);
  if (tech && tech.userId) {
    await createNotification({
      userId: tech.userId,
      title: 'Report approved',
      message: `Your completion report for ${req.requestNumber} has been approved.`,
      type: 'Assignment',
      relatedEntityType: 'ServiceRequest',
      relatedEntityId: req.id
    });
  }

  return Promise.resolve({ ...req });
}

/**
 * Manager returns report for correction. Status remains WorkCompleted, report reviewStatus becomes CorrectionRequired.
 */
export async function returnForCorrection(requestId, userId, reason) {
  const req = requests.find(r => r.id === Number(requestId));
  if (!req || req.status !== 'WorkCompleted') return Promise.resolve(null);

  addHistoryEntry(req.id, 'WorkCompleted', userId, `Report returned for correction: "${reason}"`);

  // Notify Technician
  const tech = techniciansData.find(t => t.id === req.assignedTechnicianId);
  if (tech && tech.userId) {
    await createNotification({
      userId: tech.userId,
      title: 'Correction requested',
      message: `Correction requested for ${req.requestNumber}: "${reason}".`,
      type: 'Assignment',
      relatedEntityType: 'ServiceRequest',
      relatedEntityId: req.id
    });
  }

  return Promise.resolve({ ...req });
}

/**
 * Manager generates invoice. Status → Invoiced.
 */
export async function markAsInvoiced(requestId, invoiceNumber, userId) {
  const req = requests.find(r => r.id === Number(requestId));
  if (!req || req.status !== 'Completed') return Promise.resolve(null);
  req.status = 'Invoiced';

  addHistoryEntry(req.id, 'Invoiced', userId, `Invoice ${invoiceNumber} generated`);

  // Notify Customer
  await createNotification({
    userId: req.customerId,
    title: 'New invoice available',
    message: `Invoice ${invoiceNumber} for your ${req.serviceName} service request is ready.`,
    type: 'Invoice',
    relatedEntityType: 'Invoice',
    relatedEntityId: req.id
  });

  return Promise.resolve({ ...req });
}

/**
 * Customer simulated payment. Status → Paid.
 */
export async function markAsPaid(requestId, userId) {
  const req = requests.find(r => r.id === Number(requestId));
  if (!req || req.status !== 'Invoiced') return Promise.resolve(null);
  req.status = 'Paid';

  addHistoryEntry(req.id, 'Paid', userId, 'Payment received');

  // Notify Owner and Manager
  const msg = `Payment received for invoice on request ${req.requestNumber} (${req.customerName})`;
  await createNotification({ userId: 2, title: 'Payment received', message: msg, type: 'Invoice', relatedEntityType: 'ServiceRequest', relatedEntityId: req.id });
  await createNotification({ userId: 3, title: 'Payment received', message: msg, type: 'Invoice', relatedEntityType: 'ServiceRequest', relatedEntityId: req.id });

  return Promise.resolve({ ...req });
}

/**
 * Manager closes request. Status → Closed.
 */
export async function closeRequest(requestId, userId) {
  const req = requests.find(r => r.id === Number(requestId));
  if (!req || req.status !== 'Paid') return Promise.resolve(null);
  req.status = 'Closed';

  addHistoryEntry(req.id, 'Closed', userId, 'Service request closed');

  // Notify Customer
  await createNotification({
    userId: req.customerId,
    title: 'Service request closed',
    message: `Your service request ${req.requestNumber} has been closed. Thank you!`,
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: req.id
  });

  return Promise.resolve({ ...req });
}
