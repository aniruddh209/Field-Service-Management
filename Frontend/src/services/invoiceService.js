import api from "../api/api";

export async function getAllInvoices() {
  try {
    const response = await api.get("/Invoices");
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching all invoices:", err);
    return [];
  }
}

export async function getMyInvoices() {
  try {
    const response = await api.get("/Invoices/my");
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching my invoices:", err);
    return [];
  }
}

export const getCustomerInvoices = getMyInvoices;

export async function getInvoiceById(id) {
  try {
    const response = await api.get(`/Invoices/${id}`);
    return response.data?.data || response.data || null;
  } catch (err) {
    console.error(`Error fetching invoice ${id}:`, err);
    return null;
  }
}

export async function getInvoiceByRequestId(requestId) {
  try {
    const response = await api.get(`/Invoices/request/${requestId}`);
    return response.data?.data || response.data || null;
  } catch (err) {
    console.error(`Error fetching invoice for request ${requestId}:`, err);
    return null;
  }
}

export async function generateInvoice(dto) {
  const payload = {
    serviceRequestId: Number(dto.serviceRequestId),
    serviceCharge: dto.serviceCharge !== undefined && dto.serviceCharge !== null ? Number(dto.serviceCharge) : undefined,
    labourCharge: dto.labourCharge !== undefined && dto.labourCharge !== null ? Number(dto.labourCharge) : undefined,
    taxAmount: dto.taxAmount !== undefined && dto.taxAmount !== null ? Number(dto.taxAmount) : 0,
    notes: dto.notes || null
  };
  const response = await api.post("/Invoices/generate", payload);
  return response.data?.data || response.data;
}

export const createInvoice = generateInvoice;

export async function updateInvoiceStatus(id, newStatus) {
  const response = await api.patch(`/Invoices/${id}/status`, JSON.stringify(newStatus), {
    headers: { "Content-Type": "application/json" }
  });
  return response.data?.data || response.data;
}

export async function payInvoice(id) {
  return updateInvoiceStatus(id, "Paid");
}

export async function checkInvoiceExists(requestId) {
  try {
    const response = await api.get(`/Invoices/exists/service-request/${requestId}`);
    return response.data?.exists ?? response.data?.data ?? false;
  } catch (err) {
    return false;
  }
}

export function downloadInvoicePdf(id, invoiceNumber) {
  window.print();
}

const invoiceService = {
  getAllInvoices,
  getMyInvoices,
  getCustomerInvoices,
  getInvoiceById,
  getInvoiceByRequestId,
  generateInvoice,
  createInvoice,
  updateInvoiceStatus,
  payInvoice,
  checkInvoiceExists,
  downloadInvoicePdf
};

export default invoiceService;

