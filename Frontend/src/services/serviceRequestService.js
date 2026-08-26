import api from "../api/api";
import { serviceRequestsData as initialRequests } from "../data/serviceRequestsData";
import { statusHistoryData as initialStatusHistory } from "../data/statusHistoryData";

let requestsList = [...initialRequests];
let statusHistoryList = [...initialStatusHistory];

export async function getAllServiceRequests() {
  try {
    const response = await api.get("/ServiceRequests");
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local service requests store:", err.message);
  }
  return requestsList;
}

export async function getMyServiceRequests(customerId = 1) {
  try {
    const response = await api.get(`/ServiceRequests/customer/${customerId}`);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local service requests store:", err.message);
  }
  return requestsList.filter(r => r.customerId === Number(customerId));
}

export async function getRequestsByTechnician(technicianId) {
  try {
    const response = await api.get(`/ServiceRequests/technician/${technicianId}`);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local service requests store:", err.message);
  }
  return requestsList.filter(r => r.assignedTechnicianId === Number(technicianId));
}

export async function getServiceRequestById(id) {
  try {
    const response = await api.get(`/ServiceRequests/${id}`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local service requests store:", err.message);
  }

  const req = requestsList.find(r => r.id === Number(id) || String(r.id) === String(id));
  return req || null;
}

export async function getStatusHistory(requestId) {
  try {
    const response = await api.get(`/ServiceRequests/${requestId}/history`);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local status history store:", err.message);
  }

  return statusHistoryList.filter(h => h.serviceRequestId === Number(requestId));
}

export async function createServiceRequest(requestData) {
  try {
    const response = await api.post("/ServiceRequests", requestData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local service requests store:", err.message);
  }

  const newId = requestsList.length ? Math.max(...requestsList.map(r => r.id)) + 1 : 1001;
  const newRequest = {
    id: newId,
    requestNumber: `SR-${newId}`,
    customerId: requestData.customerId || 1,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
    assignedTechnicianId: null,
    assignedTechnicianName: null,
    ...requestData
  };

  requestsList.unshift(newRequest);
  return newRequest;
}

export async function startReview(requestId) {
  try {
    const response = await api.put(`/ServiceRequests/${requestId}/start-review`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local service requests store:", err.message);
  }

  requestsList = requestsList.map(r => 
    r.id === Number(requestId) ? { ...r, status: 'UnderReview' } : r
  );
  return requestsList.find(r => r.id === Number(requestId));
}

export async function assignTechnician(requestId, technicianId, technicianName) {
  try {
    const response = await api.put(`/ServiceRequests/${requestId}/assign`, { technicianId, technicianName });
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local service requests store:", err.message);
  }

  requestsList = requestsList.map(r => {
    if (r.id === Number(requestId)) {
      return {
        ...r,
        assignedTechnicianId: Number(technicianId),
        assignedTechnicianName: technicianName || `Tech #${technicianId}`,
        status: 'Assigned'
      };
    }
    return r;
  });
  return requestsList.find(r => r.id === Number(requestId));
}

export async function approveWork(requestId) {
  try {
    const response = await api.put(`/ServiceRequests/${requestId}/approve-work`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local service requests store:", err.message);
  }

  requestsList = requestsList.map(r => 
    r.id === Number(requestId) ? { ...r, status: 'Completed', completedAt: new Date().toISOString() } : r
  );
  return requestsList.find(r => r.id === Number(requestId));
}

export async function returnForCorrection(requestId, notes) {
  try {
    const response = await api.put(`/ServiceRequests/${requestId}/return-correction`, { notes });
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local service requests store:", err.message);
  }

  requestsList = requestsList.map(r => 
    r.id === Number(requestId) ? { ...r, status: 'CorrectionRequired', correctionNotes: notes } : r
  );
  return requestsList.find(r => r.id === Number(requestId));
}

export async function markAsInvoiced(requestId) {
  try {
    const response = await api.put(`/ServiceRequests/${requestId}/mark-invoiced`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local service requests store:", err.message);
  }

  requestsList = requestsList.map(r => 
    r.id === Number(requestId) ? { ...r, status: 'Invoiced' } : r
  );
  return requestsList.find(r => r.id === Number(requestId));
}

export async function markAsPaid(requestId) {
  try {
    const response = await api.put(`/ServiceRequests/${requestId}/mark-paid`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local service requests store:", err.message);
  }

  requestsList = requestsList.map(r => 
    r.id === Number(requestId) ? { ...r, status: 'PaymentDone' } : r
  );
  return requestsList.find(r => r.id === Number(requestId));
}

export async function closeRequest(requestId) {
  try {
    const response = await api.put(`/ServiceRequests/${requestId}/close`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local service requests store:", err.message);
  }

  requestsList = requestsList.map(r => 
    r.id === Number(requestId) ? { ...r, status: 'Closed' } : r
  );
  return requestsList.find(r => r.id === Number(requestId));
}
