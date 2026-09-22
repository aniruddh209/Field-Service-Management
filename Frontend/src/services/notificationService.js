// ====================================
// Notification Service
// ====================================
// Endpoints match backend NotificationsController exactly.
// GET /api/Notifications/my
// GET /api/Notifications/{id}
// GET /api/Notifications/count
// PATCH /api/Notifications/{id}/read
// PATCH /api/Notifications/read-all
// NO mock data fallbacks.
// ====================================

import api from "../api/api";

export async function getMyNotifications() {
  const response = await api.get("/Notifications/my");
  return response.data?.data || response.data || [];
}

export const getNotificationsForUser = getMyNotifications;

export async function getNotificationById(id) {
  const response = await api.get(`/Notifications/${id}`);
  return response.data?.data || response.data;
}

export async function getNotificationCount() {
  const response = await api.get("/Notifications/count");
  return response.data?.data || response.data;
}

export async function markAsRead(id) {
  const response = await api.patch(`/Notifications/${id}/read`);
  return response.data;
}

export async function markAllAsRead() {
  const response = await api.patch("/Notifications/read-all");
  return response.data;
}

export async function clearNotification(id) {
  const response = await api.delete(`/Notifications/${id}`);
  return response.data;
}

export async function clearAllNotifications() {
  const response = await api.delete("/Notifications/clear-all");
  return response.data;
}

const notificationService = {
  getMyNotifications,
  getNotificationsForUser,
  getNotificationById,
  getNotificationCount,
  markAsRead,
  markAllAsRead,
  clearNotification,
  clearAllNotifications
};

export default notificationService;
