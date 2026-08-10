// ====================================
// Invoice Service
// ====================================
//
// Operations on invoice records.
//
// Current: returns local dummy arrays.
// Future:
//   GET /api/invoices/my       — customer's own invoices (JWT)
//   GET /api/invoices          — all invoices (management)
//   GET /api/invoices/{id}
//
// ====================================

import { invoicesData } from '../data/invoicesData.js';

let invoices = [...invoicesData];

/**
 * Fetches invoices for a specific customer.
 * Future: GET /api/invoices/my (backend gets userId from JWT)
 */
export async function getCustomerInvoices(customerId) {
  return Promise.resolve(
    invoices
      .filter(i => i.customerId === customerId)
      .sort((a, b) => b.id - a.id)
  );
}

/**
 * Fetches ALL invoices (for management view).
 * Future: GET /api/invoices
 */
export async function getAllInvoices() {
  return Promise.resolve(
    [...invoices].sort((a, b) => b.id - a.id)
  );
}

/**
 * Retrieves a single invoice.
 * Future: GET /api/invoices/{id}
 */
export async function getInvoiceById(id) {
  return Promise.resolve(invoices.find(i => i.id === Number(id)) || null);
}

/**
 * Fetches unpaid invoices for a customer.
 * Future: GET /api/invoices/my?status=Pending
 */
export async function getPendingInvoices(customerId) {
  return Promise.resolve(
    invoices.filter(i => i.customerId === customerId && i.status === 'Pending')
  );
}

/**
 * Creates a new invoice record.
 * Future: POST /api/invoices
 */
export async function createInvoice(data) {
  const nextId = Math.max(...invoices.map(i => i.id), 0) + 1;
  const newInvoice = {
    id: nextId,
    invoiceNumber: `INV-2026-${String(nextId).padStart(3, '0')}`,
    status: 'Pending',
    issuedAt: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days due
    paidAt: null,
    ...data
  };
  invoices.push(newInvoice);
  return Promise.resolve(newInvoice);
}

/**
 * Marks an invoice as paid.
 * Future: PATCH /api/invoices/{id}/mark-paid
 */
export async function payInvoice(invoiceId) {
  const invoice = invoices.find(i => i.id === Number(invoiceId));
  if (invoice) {
    invoice.status = 'Paid';
    invoice.paidAt = new Date().toISOString().split('T')[0];
  }
  return Promise.resolve(invoice || null);
}

/**
 * Downloads or generates invoice PDF.
 * Connects to GET /api/invoices/{id}/pdf backend endpoint when available,
 * or triggers browser print/download fallback.
 */
export async function downloadInvoicePdf(invoiceId, invoiceNumber = 'invoice') {
  try {
    const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return true;
    }
  } catch (e) {
    console.log('Backend PDF endpoint not reached. Triggering print preview fallback.');
  }

  // Fallback to browser print/PDF preview dialog
  window.print();
  return true;
}

