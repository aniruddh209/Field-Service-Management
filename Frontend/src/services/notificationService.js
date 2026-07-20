// ====================================
// Notification Service
// ====================================
//
// Handles notification retrieval and read-state management.
//
// CRITICAL PRIVACY RULE:
// getNotificationsForUser(userId) filters by userId so each user
// only sees their own notifications. Never expose all notifications.
//
// Current: modifies local dummy copy in memory (resets on reload).
// Future:
//   GET   /api/notifications/my        — backend reads userId from JWT
//   PATCH /api/notifications/{id}/read
//   PATCH /api/notifications/read-all
//
// ====================================

import { notificationsData } from '../data/notificationsData.js';

// In-memory copy for mock mutations
let notifications = [...notificationsData];

/**
 * Fetches notifications for a specific user.
 * Future: GET /api/notifications/my (backend gets userId from JWT)
 * @param {number} userId - The logged-in user's ID
 * @returns {Promise<Array>} User-specific notifications sorted newest-first
 */
export async function getNotificationsForUser(userId) {
  return Promise.resolve(
    notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  );
}

/**
 * Returns the count of unread notifications for a user.
 * Future: GET /api/notifications/my/unread-count
 * @param {number} userId
 * @returns {Promise<number>}
 */
export async function getUnreadCount(userId) {
  const count = notifications.filter(n => n.userId === userId && !n.isRead).length;
  return Promise.resolve(count);
}

/**
 * Marks a single notification as read.
 * Future: PATCH /api/notifications/{id}/read
 * @param {number} notificationId
 * @returns {Promise<boolean>}
 */
export async function markAsRead(notificationId) {
  const target = notifications.find(n => n.id === notificationId);
  if (target) {
    target.isRead = true;
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

/**
 * Marks all notifications as read for a user.
 * Future: PATCH /api/notifications/read-all
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
export async function markAllAsRead(userId) {
  notifications = notifications.map(n =>
    n.userId === userId ? { ...n, isRead: true } : n
  );
  return Promise.resolve(true);
}

/**
 * Creates a new notification (used internally by mock mutations).
 * Future: Notifications are created server-side, not by frontend.
 * @param {Object} data - Notification DTO
 * @returns {Promise<Object>}
 */
export async function createNotification(data) {
  const newNotification = {
    ...data,
    id: Math.max(...notifications.map(n => n.id), 0) + 1,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  notifications.push(newNotification);
  return Promise.resolve(newNotification);
}
