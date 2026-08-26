import api from "../api/api";
import { notificationsData as initialNotifications } from "../data/notificationsData";

let notificationsList = [...initialNotifications];

export async function getNotificationsForUser(userId) {
  try {
    const response = await api.get(`/Notifications?userId=${userId}`);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local notifications store:", err.message);
  }
  return notificationsList.filter(n => n.userId === Number(userId));
}

export async function markAsRead(id) {
  try {
    const response = await api.put(`/Notifications/${id}/read`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local notifications store:", err.message);
  }

  notificationsList = notificationsList.map(n => 
    n.id === Number(id) ? { ...n, isRead: true } : n
  );
  return notificationsList.find(n => n.id === Number(id));
}

export async function markAllAsRead(userId) {
  try {
    const response = await api.put(`/Notifications/mark-all-read?userId=${userId}`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local notifications store:", err.message);
  }

  notificationsList = notificationsList.map(n => 
    n.userId === Number(userId) ? { ...n, isRead: true } : n
  );
  return notificationsList.filter(n => n.userId === Number(userId));
}
