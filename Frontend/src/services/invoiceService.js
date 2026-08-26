import api from "../api/api";
import { invoicesData as initialInvoices } from "../data/invoicesData";

let invoicesList = [...initialInvoices];

export async function getCustomerInvoices(customerId = 1) {
  try {
    const response = await api.get(`/Invoices?customerId=${customerId}`);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local invoices store:", err.message);
  }
  return invoicesList.filter(i => i.customerId === Number(customerId));
}

export async function getAllInvoices() {
  try {
    const response = await api.get("/Invoices");
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local invoices store:", err.message);
  }
  return invoicesList;
}

export async function getInvoiceById(id) {
  try {
    const response = await api.get(`/Invoices/${id}`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local invoices store:", err.message);
  }

  const invoice = invoicesList.find(i => 
    i.id === Number(id) || i.invoiceNumber === String(id) || String(i.id) === String(id)
  );
  return invoice || null;
}

export async function createInvoice(invoiceData) {
  try {
    const response = await api.post("/Invoices", invoiceData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local invoices store:", err.message);
  }

  const newId = invoicesList.length ? Math.max(...invoicesList.map(i => i.id)) + 1 : 101;
  const newInvoice = {
    id: newId,
    invoiceNumber: `INV-2026-${newId}`,
    status: 'Pending',
    issuedAt: new Date().toISOString().split('T')[0],
    paidAt: null,
    ...invoiceData
  };
  invoicesList.unshift(newInvoice);
  return newInvoice;
}

export async function payInvoice(id, paymentDetails = {}) {
  try {
    const response = await api.post(`/Invoices/${id}/pay`, paymentDetails);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local invoices store:", err.message);
  }

  invoicesList = invoicesList.map(i => {
    if (i.id === Number(id) || String(i.id) === String(id)) {
      return {
        ...i,
        status: 'Paid',
        paidAt: new Date().toISOString().split('T')[0],
        paymentMethod: paymentDetails.method || 'Online'
      };
    }
    return i;
  });
  return invoicesList.find(i => i.id === Number(id) || String(i.id) === String(id));
}

export async function downloadInvoicePdf(id) {
  console.log(`Downloading PDF for invoice ${id}`);
  return { success: true, message: `Invoice #${id} download triggered.` };
}
