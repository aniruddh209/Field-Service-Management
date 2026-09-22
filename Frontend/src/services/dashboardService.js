import api from "../api/api";
import { getMyServiceRequests } from "./serviceRequestService";
import { getMyInvoices } from "./invoiceService";
import { getMyAssets } from "./assetService";

export async function getCustomerDashboard() {
  const [requests, invoices, assets] = await Promise.all([
    getMyServiceRequests().catch(() => []),
    getMyInvoices().catch(() => []),
    getMyAssets().catch(() => [])
  ]);

  const activeRequests = requests.filter(r => 
    ['Pending', 'Assigned', 'InProgress'].includes(r.status)
  );

  const completedRequests = requests.filter(r => 
    r.status === 'Completed' || r.status === 'Cancelled'
  );

  const unpaidInvoices = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Pending');
  const pendingPaymentAmount = unpaidInvoices.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
  const pendingPaymentInvoice = unpaidInvoices[0] || null;

  const upcomingAppointment = activeRequests.find(r => r.preferredDate) || activeRequests[0] || null;

  return {
    summary: {
      activeCount: activeRequests.length,
      activeRequestsCount: activeRequests.length,
      completedCount: completedRequests.length,
      completedServicesCount: completedRequests.length,
      assetsCount: assets.length,
      invoicesCount: invoices.length,
      pendingPaymentAmount,
      pendingPaymentCount: unpaidInvoices.length
    },
    activeRequests,
    upcomingAppointment: upcomingAppointment ? {
      date: upcomingAppointment.preferredDate,
      time: upcomingAppointment.notes || 'Scheduled Visit',
      serviceName: upcomingAppointment.serviceName,
      technicianName: upcomingAppointment.technicianName || 'To be assigned',
      location: upcomingAppointment.serviceAddress,
      requestId: upcomingAppointment.id
    } : null,
    recentHistory: completedRequests.slice(0, 5),
    pendingPayment: pendingPaymentInvoice ? {
      invoiceId: pendingPaymentInvoice.invoiceNumber || `INV-${pendingPaymentInvoice.id}`,
      amount: pendingPaymentInvoice.totalAmount,
      dueDate: pendingPaymentInvoice.issuedAt || new Date().toISOString(),
      id: pendingPaymentInvoice.id,
      path: `/customer/invoices`
    } : null
  };
}

export async function getManagementDashboard() {
  const [requestsRes, dashboardRes] = await Promise.all([
    api.get("/ServiceRequests").catch(() => ({ data: { data: [] } })),
    api.get("/ServiceRequests/management-dashboard").catch(() => ({ data: { data: {} } }))
  ]);

  const requests = requestsRes.data?.data || requestsRes.data || [];
  const metrics = dashboardRes.data?.data || {};

  const recentRequests = requests.slice(0, 5);
  const todaySchedule = requests.filter(r => ['Assigned', 'InProgress'].includes(r.status));
  const activeJobs = requests.filter(r => r.status === 'InProgress');
  const pendingRequests = requests.filter(r => r.status === 'Pending');

  const quickActions = [
    { label: 'Assign Technician', desc: 'Dispatch available tech', link: '/management/requests', iconName: 'UserPlus', color: 'accent' },
    { label: 'Manage Services', desc: 'View and update services', link: '/management/services', iconName: 'Wrench', color: 'primary' },
    { label: 'Manage Inventory', desc: 'Update stock counts', link: '/management/inventory', iconName: 'ClipboardList', color: 'success' },
    { label: 'Generate Invoice', desc: 'Bill completed job', link: '/management/invoices', iconName: 'Receipt', color: 'warning' }
  ];

  return {
    kpiCards: [
      { label: "Total Requests", value: metrics.totalRequests ?? requests.length, change: "All time" },
      { label: "Pending Requests", value: metrics.pendingRequests ?? pendingRequests.length, change: "Action required" },
      { label: "Active Jobs", value: metrics.inProgressRequests ?? activeJobs.length, change: "In progress" },
      { label: "Completed Jobs", value: metrics.completedRequests ?? requests.filter(r => r.status === 'Completed').length, change: "Done" }
    ],
    recentRequests,
    todaySchedule,
    activeJobs,
    quickActions
  };
}

