// ====================================
// Dashboard Service
// ====================================
//
// Asynchronously retrieves KPI stats and attention markers for role dashboards.
//
// Current: returns local dummy calculations.
// Future: GET /api/dashboards/customer/{id} or GET /api/dashboards/management
//
// ====================================

import { serviceRequestsData } from '../data/serviceRequestsData.js';
import { invoicesData } from '../data/invoicesData.js';
import {
  managementKpiCards,
  managementAttentionItems,
  managementQuickActions
} from '../data/dashboardData.js';

/**
 * Compiles dashboard metrics for a customer.
 * Future: GET /api/dashboard/customer/{customerId}
 * @param {number} customerId - Customer identifier
 * @returns {Promise<Object>} Formatted customer dashboard data
 */
export async function getCustomerDashboard(customerId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const myRequests = serviceRequestsData.filter(r => r.customerId === customerId);
      
      const activeCount = myRequests.filter(r => 
        ['Pending', 'UnderReview', 'Assigned', 'Accepted', 'OnTheWay', 'InProgress'].includes(r.status)
      ).length;

      const completedCount = myRequests.filter(r => r.status === 'Completed').length;
      
      // Calculate pending payments
      const myInvoices = invoicesData.filter(i => i.customerId === customerId);
      const pendingInvoices = myInvoices.filter(i => i.status === 'Pending');
      const pendingAmount = pendingInvoices.reduce((sum, item) => sum + item.totalAmount, 0);

      // Find next upcoming appointment
      const upcoming = serviceRequestsData
        .filter(r => r.customerId === customerId && ['Assigned', 'Accepted', 'OnTheWay', 'InProgress'].includes(r.status))
        .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate))[0] || null;

      resolve({
        summary: {
          activeRequestsCount: activeCount,
          upcomingAppointmentLabel: upcoming ? 'Upcoming' : 'None Scheduled',
          upcomingAppointmentTime: upcoming ? upcoming.preferredTime : '',
          upcomingAppointmentService: upcoming ? upcoming.serviceName : '',
          completedServicesCount: completedCount,
          pendingPaymentAmount: pendingAmount,
          pendingPaymentCount: pendingInvoices.length
        },
        activeRequests: myRequests.filter(r => r.status !== 'Completed').slice(0, 3),
        upcomingAppointment: upcoming ? {
          serviceName: upcoming.serviceName,
          date: upcoming.preferredDate,
          time: upcoming.preferredTime,
          technicianName: upcoming.assignedTechnicianName || 'To Be Assigned',
          location: upcoming.addressShortText,
          requestId: upcoming.requestNumber
        } : null,
        recentHistory: myRequests.filter(r => r.status === 'Completed').slice(0, 3),
        pendingPayment: pendingInvoices[0] ? {
          invoiceId: pendingInvoices[0].invoiceNumber,
          serviceName: pendingInvoices[0].requestNumber + ' - ' + pendingInvoices[0].totalAmount,
          amount: pendingInvoices[0].totalAmount,
          path: '/customer/invoices'
        } : null
      });
    }, 120);
  });
}

/**
 * Compiles dashboard metrics for owners/managers.
 * Future: GET /api/dashboard/management
 * @returns {Promise<Object>} Formatted management dashboard data
 */
export async function getManagementDashboard() {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Recent requests: last 4 requests
      const recent = [...serviceRequestsData]
        .sort((a, b) => b.id - a.id)
        .slice(0, 4);

      // Schedule: requests occurring on a targeted date (e.g. 2026-07-08)
      const schedule = serviceRequestsData
        .filter(r => r.preferredDate === '2026-07-08')
        .map(r => ({
          time: r.preferredTime.includes('AM') || r.preferredTime.includes('PM') 
            ? r.preferredTime 
            : formatTimeLabel(r.preferredTime),
          service: r.serviceName,
          customer: r.customerName,
          technician: r.assignedTechnicianName || 'Unassigned',
          status: r.status
        }))
        .sort((a, b) => a.time.localeCompare(b.time));

      // Active jobs: requests that are Assigned, Accepted, OnTheWay, InProgress
      const active = [...serviceRequestsData]
        .filter(r => ['Assigned', 'Accepted', 'OnTheWay', 'InProgress'].includes(r.status))
        .slice(0, 3);

      resolve({
        kpiCards: managementKpiCards,
        recentRequests: recent,
        todaySchedule: schedule,
        quickActions: managementQuickActions,
        attentionItems: managementAttentionItems,
        activeJobs: active
      });
    }, 120);
  });
}

// Simple time formatter for 24h mock inputs -> 12h labels
function formatTimeLabel(timeStr) {
  if (!timeStr) return '';
  const [hourStr, minStr] = timeStr.split(':');
  const hour = Number(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const padHour = displayHour < 10 ? '0' + displayHour : displayHour;
  return `${padHour}:${minStr} ${ampm}`;
}
