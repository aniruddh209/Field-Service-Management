// ====================================
// Invoices Data Store
// ====================================
//
// Centralized mock database for Invoices.
// Each invoice links to a service request and customer.
// Arjun's pending total = ₹2,450 (matches dashboard).
//
// ====================================

export const invoicesData = [
  // ---- Arjun Mehta (customerId: 1) ----
  {
    id: 104,
    invoiceNumber: 'INV-2026-104',
    serviceRequestId: 1024,
    requestNumber: 'SR-1024',
    customerId: 1,
    customerName: 'Arjun Mehta',
    serviceName: 'AC Repair',
    serviceAmount: 1800,
    partsAmount: 450,
    taxAmount: 200,
    totalAmount: 2450,
    status: 'Pending',
    issuedAt: '2026-07-07',
    dueDate: '2026-07-12',
    paidAt: null
  },
  {
    id: 102,
    invoiceNumber: 'INV-2026-102',
    serviceRequestId: 998,
    requestNumber: 'SR-0998',
    customerId: 1,
    customerName: 'Arjun Mehta',
    serviceName: 'AC Cleaning',
    serviceAmount: 699,
    partsAmount: 0,
    taxAmount: 126,
    totalAmount: 825,
    status: 'Paid',
    issuedAt: '2026-06-28',
    dueDate: '2026-07-03',
    paidAt: '2026-06-28'
  },
  {
    id: 101,
    invoiceNumber: 'INV-2026-101',
    serviceRequestId: 975,
    requestNumber: 'SR-0975',
    customerId: 1,
    customerName: 'Arjun Mehta',
    serviceName: 'Washing Machine Repair',
    serviceAmount: 1200,
    partsAmount: 500,
    taxAmount: 150,
    totalAmount: 1850,
    status: 'Paid',
    issuedAt: '2026-06-15',
    dueDate: '2026-06-20',
    paidAt: '2026-06-16'
  },
  {
    id: 100,
    invoiceNumber: 'INV-2026-100',
    serviceRequestId: 954,
    requestNumber: 'SR-0954',
    customerId: 1,
    customerName: 'Arjun Mehta',
    serviceName: 'Electrical Service',
    serviceAmount: 500,
    partsAmount: 100,
    taxAmount: 50,
    totalAmount: 650,
    status: 'Paid',
    issuedAt: '2026-06-03',
    dueDate: '2026-06-08',
    paidAt: '2026-06-03'
  },

  // ---- Rahul Patel (customerId: 5) ----
  {
    id: 105,
    invoiceNumber: 'INV-2026-105',
    serviceRequestId: 1015,
    requestNumber: 'SR-1015',
    customerId: 5,
    customerName: 'Rahul Patel',
    serviceName: 'Plumbing Service',
    serviceAmount: 349,
    partsAmount: 80,
    taxAmount: 77,
    totalAmount: 506,
    status: 'Paid',
    issuedAt: '2026-07-05',
    dueDate: '2026-07-10',
    paidAt: '2026-07-06'
  },

  // ---- Priya Shah (customerId: 6) ----
  {
    id: 106,
    invoiceNumber: 'INV-2026-106',
    serviceRequestId: 1010,
    requestNumber: 'SR-1010',
    customerId: 6,
    customerName: 'Priya Shah',
    serviceName: 'Washing Machine Repair',
    serviceAmount: 1100,
    partsAmount: 850,
    taxAmount: 175,
    totalAmount: 2125,
    status: 'Pending',
    issuedAt: '2026-07-03',
    dueDate: '2026-07-08',
    paidAt: null
  },
  {
    id: 103,
    invoiceNumber: 'INV-2026-103',
    serviceRequestId: 1005,
    requestNumber: 'SR-1005',
    customerId: 6,
    customerName: 'Priya Shah',
    serviceName: 'Plumbing Service',
    serviceAmount: 349,
    partsAmount: 120,
    taxAmount: 84,
    totalAmount: 553,
    status: 'Paid',
    issuedAt: '2026-06-20',
    dueDate: '2026-06-25',
    paidAt: '2026-06-21'
  },

  // ---- Mehul Desai (customerId: 7) ----
  {
    id: 107,
    invoiceNumber: 'INV-2026-107',
    serviceRequestId: 1016,
    requestNumber: 'SR-1016',
    customerId: 7,
    customerName: 'Mehul Desai',
    serviceName: 'Refrigerator Repair',
    serviceAmount: 549,
    partsAmount: 400,
    taxAmount: 171,
    totalAmount: 1120,
    status: 'Overdue',
    issuedAt: '2026-07-06',
    dueDate: '2026-07-08',
    paidAt: null
  },
  {
    id: 99,
    invoiceNumber: 'INV-2026-099',
    serviceRequestId: 990,
    requestNumber: 'SR-0990',
    customerId: 7,
    customerName: 'Mehul Desai',
    serviceName: 'Water Purifier Service',
    serviceAmount: 499,
    partsAmount: 350,
    taxAmount: 153,
    totalAmount: 1002,
    status: 'Paid',
    issuedAt: '2026-06-25',
    dueDate: '2026-06-30',
    paidAt: '2026-06-26'
  }
];
