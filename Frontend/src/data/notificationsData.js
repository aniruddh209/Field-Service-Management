// ====================================
// Notifications Data Store
// ====================================
//
// Every notification has a userId field.
// The NotificationButton and service layer MUST filter by userId
// so each user only sees their own notifications.
//
// PRIVACY RULE:
//   Customer → only their own request updates
//   Owner/Manager → business-wide operational alerts
//   Technician → only their assigned job notifications
//
// ====================================

export const notificationsData = [
  // ---- Arjun Mehta (userId: 1 — Customer) ----
  {
    id: 1,
    userId: 1,
    title: 'Technician assigned',
    message: 'Ravi Kumar has been assigned to your AC Repair request SR-1024.',
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: 1024,
    isRead: false,
    createdAt: '2026-07-07T11:30:00'
  },
  {
    id: 2,
    userId: 1,
    title: 'Service in progress',
    message: 'Your technician has started working on SR-1024 — AC Repair.',
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: 1024,
    isRead: false,
    createdAt: '2026-07-08T10:45:00'
  },
  {
    id: 3,
    userId: 1,
    title: 'Request created',
    message: 'Your service request SR-1019 for Water Purifier Service has been submitted.',
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: 1019,
    isRead: true,
    createdAt: '2026-07-07T20:45:00'
  },
  {
    id: 4,
    userId: 1,
    title: 'Invoice generated',
    message: 'Invoice INV-2026-104 for ₹2,450 has been generated for SR-1024.',
    type: 'Invoice',
    relatedEntityType: 'Invoice',
    relatedEntityId: 104,
    isRead: false,
    createdAt: '2026-07-07T15:00:00'
  },
  {
    id: 5,
    userId: 1,
    title: 'Technician assigned',
    message: 'Amit Singh has been assigned to your CCTV Installation request SR-1021.',
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: 1021,
    isRead: true,
    createdAt: '2026-07-06T16:00:00'
  },
  {
    id: 6,
    userId: 1,
    title: 'Service completed',
    message: 'Your AC Cleaning (SR-0998) has been completed successfully.',
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: 998,
    isRead: true,
    createdAt: '2026-06-28T12:00:00'
  },

  // ---- Owner Aniruddh (userId: 2) ----
  {
    id: 10,
    userId: 2,
    title: 'New service request',
    message: 'New request SR-1019 received from Arjun Mehta — Water Purifier Service.',
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: 1019,
    isRead: false,
    createdAt: '2026-07-07T20:45:00'
  },
  {
    id: 11,
    userId: 2,
    title: 'New service request',
    message: 'New request SR-1018 received from Rahul Patel — Electrical Service.',
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: 1018,
    isRead: false,
    createdAt: '2026-07-08T06:30:00'
  },
  {
    id: 12,
    userId: 2,
    title: 'Low stock warning',
    message: 'AC Capacitor 35uF stock (4 units) is below reorder level (6 units).',
    type: 'Inventory',
    relatedEntityType: 'Inventory',
    relatedEntityId: 1,
    isRead: false,
    createdAt: '2026-07-08T07:00:00'
  },
  {
    id: 13,
    userId: 2,
    title: 'Out of stock alert',
    message: 'Washing Machine Drain Pump is out of stock. Reorder needed.',
    type: 'Inventory',
    relatedEntityType: 'Inventory',
    relatedEntityId: 10,
    isRead: true,
    createdAt: '2026-07-07T09:00:00'
  },
  {
    id: 14,
    userId: 2,
    title: 'Job completed',
    message: 'Ravi Kumar completed Refrigerator Repair (SR-1016) for Mehul Desai.',
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: 1016,
    isRead: true,
    createdAt: '2026-07-06T12:30:00'
  },
  {
    id: 15,
    userId: 2,
    title: 'Invoice overdue',
    message: 'Invoice INV-2026-107 for Mehul Desai (₹1,120) is overdue.',
    type: 'Invoice',
    relatedEntityType: 'Invoice',
    relatedEntityId: 107,
    isRead: false,
    createdAt: '2026-07-08T08:00:00'
  },

  // ---- Manager Kavya (userId: 3) ----
  {
    id: 20,
    userId: 3,
    title: 'New service request',
    message: 'New request SR-1019 received from Arjun Mehta — Water Purifier Service.',
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: 1019,
    isRead: false,
    createdAt: '2026-07-07T20:45:00'
  },
  {
    id: 21,
    userId: 3,
    title: 'New service request',
    message: 'New request SR-1018 received from Rahul Patel — Electrical Service.',
    type: 'Request',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: 1018,
    isRead: false,
    createdAt: '2026-07-08T06:30:00'
  },
  {
    id: 22,
    userId: 3,
    title: 'Low stock warning',
    message: 'AC Capacitor 35uF stock is below reorder level.',
    type: 'Inventory',
    relatedEntityType: 'Inventory',
    relatedEntityId: 1,
    isRead: true,
    createdAt: '2026-07-08T07:00:00'
  },

  // ---- Technician Ravi (userId: 4) ----
  {
    id: 30,
    userId: 4,
    title: 'New job assigned',
    message: 'You have been assigned to SR-1024 — AC Repair for Arjun Mehta.',
    type: 'Assignment',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: 1024,
    isRead: true,
    createdAt: '2026-07-07T11:30:00'
  },
  {
    id: 31,
    userId: 4,
    title: 'Job completed',
    message: 'You successfully completed SR-1016 — Refrigerator Repair for Mehul Desai.',
    type: 'Assignment',
    relatedEntityType: 'ServiceRequest',
    relatedEntityId: 1016,
    isRead: true,
    createdAt: '2026-07-06T12:30:00'
  }
];
