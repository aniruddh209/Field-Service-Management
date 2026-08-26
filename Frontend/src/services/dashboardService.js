import api from "../api/api";
import { serviceRequestsData } from "../data/serviceRequestsData";
import { invoicesData } from "../data/invoicesData";
import { assetsData } from "../data/assetsData";
import { 
  managementKpiCards, 
  managementQuickActions, 
  managementAttentionItems 
} from "../data/dashboardData";

export async function getCustomerDashboard(customerId = 1) {
  try {
    const response = await api.get(`/Dashboard/customer/${customerId}`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local dashboard data generation:", err.message);
  }

  const custId = Number(customerId);
  const myRequests = serviceRequestsData.filter(r => r.customerId === custId);
  const myInvoices = invoicesData.filter(i => i.customerId === custId);
  const myAssets = assetsData.filter(a => a.customerId === custId);

  const activeRequests = myRequests.filter(r => 
    ['Pending', 'UnderReview', 'Assigned', 'Accepted', 'OnTheWay', 'InProgress'].includes(r.status)
  );

  const completedRequests = myRequests.filter(r => 
    ['Completed', 'Invoiced', 'PaymentDone', 'Closed'].includes(r.status)
  );

  const upcomingAppointment = activeRequests.find(r => r.preferredDate && r.preferredTime) || activeRequests[0] || null;

  const pendingPaymentInvoice = myInvoices.find(i => i.status === 'Pending') || null;

  return {
    summary: {
      activeCount: activeRequests.length,
      completedCount: completedRequests.length,
      assetsCount: myAssets.length,
      invoicesCount: myInvoices.length
    },
    activeRequests,
    upcomingAppointment,
    recentHistory: completedRequests.slice(0, 5),
    pendingPayment: pendingPaymentInvoice ? {
      invoiceId: pendingPaymentInvoice.invoiceNumber || `INV-${pendingPaymentInvoice.id}`,
      amount: pendingPaymentInvoice.totalAmount,
      dueDate: pendingPaymentInvoice.dueDate,
      id: pendingPaymentInvoice.id
    } : null
  };
}

export async function getManagementDashboard() {
  try {
    const response = await api.get("/Dashboard/management");
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local dashboard data generation:", err.message);
  }

  const recentRequests = serviceRequestsData.slice(0, 5);
  const todaySchedule = serviceRequestsData.filter(r => 
    ['InProgress', 'Assigned', 'Accepted', 'OnTheWay'].includes(r.status)
  );
  const activeJobs = serviceRequestsData.filter(r => r.status === 'InProgress');

  return {
    kpiCards: managementKpiCards,
    recentRequests,
    todaySchedule,
    quickActions: managementQuickActions,
    attentionItems: managementAttentionItems,
    activeJobs
  };
}
