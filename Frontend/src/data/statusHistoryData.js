// ====================================
// Status History Data Store
// ====================================
//
// Timeline entries for service requests.
// Each entry records who changed the status and when.
// Used in Request Details pages for the progress timeline.
//
// ====================================

export const statusHistoryData = [
  // ---- SR-1024 (InProgress) ----
  { id: 1, serviceRequestId: 1024, status: 'Pending', changedAt: '2026-07-07T09:15:00', changedByUserId: 1, note: 'Request created by customer' },
  { id: 2, serviceRequestId: 1024, status: 'UnderReview', changedAt: '2026-07-07T09:45:00', changedByUserId: 3, note: 'Manager started review' },
  { id: 3, serviceRequestId: 1024, status: 'Assigned', changedAt: '2026-07-07T11:30:00', changedByUserId: 2, note: 'Assigned to Ravi Kumar' },
  { id: 4, serviceRequestId: 1024, status: 'Accepted', changedAt: '2026-07-07T12:00:00', changedByUserId: 4, note: 'Technician accepted the job' },
  { id: 5, serviceRequestId: 1024, status: 'OnTheWay', changedAt: '2026-07-08T10:00:00', changedByUserId: 4, note: 'Technician is on the way' },
  { id: 6, serviceRequestId: 1024, status: 'InProgress', changedAt: '2026-07-08T10:30:00', changedByUserId: 4, note: 'Work started at customer location' },

  // ---- SR-1021 (Assigned) ----
  { id: 10, serviceRequestId: 1021, status: 'Pending', changedAt: '2026-07-06T14:20:00', changedByUserId: 1, note: 'Request created by customer' },
  { id: 11, serviceRequestId: 1021, status: 'UnderReview', changedAt: '2026-07-06T15:00:00', changedByUserId: 3, note: 'Under review by manager' },
  { id: 12, serviceRequestId: 1021, status: 'Assigned', changedAt: '2026-07-06T16:30:00', changedByUserId: 2, note: 'Assigned to Amit Singh' },

  // ---- SR-1019 (Pending) ----
  { id: 15, serviceRequestId: 1019, status: 'Pending', changedAt: '2026-07-07T20:45:00', changedByUserId: 1, note: 'Request created by customer' },

  // ---- SR-0998 (Closed) ----
  { id: 20, serviceRequestId: 998, status: 'Pending', changedAt: '2026-06-27T08:00:00', changedByUserId: 1, note: 'Request created by customer' },
  { id: 21, serviceRequestId: 998, status: 'UnderReview', changedAt: '2026-06-27T08:30:00', changedByUserId: 3, note: 'Under review' },
  { id: 22, serviceRequestId: 998, status: 'Assigned', changedAt: '2026-06-27T09:00:00', changedByUserId: 2, note: 'Assigned to Ravi Kumar' },
  { id: 23, serviceRequestId: 998, status: 'Accepted', changedAt: '2026-06-27T09:30:00', changedByUserId: 4, note: 'Accepted' },
  { id: 24, serviceRequestId: 998, status: 'OnTheWay', changedAt: '2026-06-28T10:30:00', changedByUserId: 4, note: 'On the way' },
  { id: 25, serviceRequestId: 998, status: 'InProgress', changedAt: '2026-06-28T11:00:00', changedByUserId: 4, note: 'Work started' },
  { id: 26, serviceRequestId: 998, status: 'Completed', changedAt: '2026-06-28T12:00:00', changedByUserId: 4, note: 'Service completed' },
  { id: 27, serviceRequestId: 998, status: 'Invoiced', changedAt: '2026-06-28T12:30:00', changedByUserId: 2, note: 'Invoice generated' },
  { id: 28, serviceRequestId: 998, status: 'PaymentDone', changedAt: '2026-06-28T13:00:00', changedByUserId: 1, note: 'Payment received' },
  { id: 29, serviceRequestId: 998, status: 'Closed', changedAt: '2026-06-28T13:30:00', changedByUserId: 2, note: 'Request closed' },

  // ---- SR-0975 (PaymentDone) ----
  { id: 30, serviceRequestId: 975, status: 'Pending', changedAt: '2026-06-14T09:30:00', changedByUserId: 1, note: 'Request created' },
  { id: 31, serviceRequestId: 975, status: 'Assigned', changedAt: '2026-06-14T10:00:00', changedByUserId: 2, note: 'Assigned to Neha Patel' },
  { id: 32, serviceRequestId: 975, status: 'Accepted', changedAt: '2026-06-14T10:30:00', changedByUserId: 4, note: 'Accepted' },
  { id: 33, serviceRequestId: 975, status: 'InProgress', changedAt: '2026-06-15T15:00:00', changedByUserId: 4, note: 'Work started' },
  { id: 34, serviceRequestId: 975, status: 'Completed', changedAt: '2026-06-15T16:30:00', changedByUserId: 4, note: 'Completed' },
  { id: 35, serviceRequestId: 975, status: 'Invoiced', changedAt: '2026-06-15T17:00:00', changedByUserId: 2, note: 'Invoice generated' },
  { id: 36, serviceRequestId: 975, status: 'PaymentDone', changedAt: '2026-06-16T10:00:00', changedByUserId: 1, note: 'Payment received' },

  // ---- SR-1023 (UnderReview) ----
  { id: 40, serviceRequestId: 1023, status: 'Pending', changedAt: '2026-07-07T18:30:00', changedByUserId: 5, note: 'Request created by customer' },
  { id: 41, serviceRequestId: 1023, status: 'UnderReview', changedAt: '2026-07-08T08:00:00', changedByUserId: 3, note: 'Manager reviewing request' },

  // ---- SR-1022 (Accepted) ----
  { id: 45, serviceRequestId: 1022, status: 'Pending', changedAt: '2026-07-07T17:45:00', changedByUserId: 6, note: 'Request created' },
  { id: 46, serviceRequestId: 1022, status: 'Assigned', changedAt: '2026-07-07T18:30:00', changedByUserId: 2, note: 'Assigned to Amit Singh' },
  { id: 47, serviceRequestId: 1022, status: 'Accepted', changedAt: '2026-07-07T19:00:00', changedByUserId: 2, note: 'Technician accepted' },

  // ---- SR-1020 (OnTheWay) ----
  { id: 50, serviceRequestId: 1020, status: 'Pending', changedAt: '2026-07-07T16:10:00', changedByUserId: 7, note: 'Request created' },
  { id: 51, serviceRequestId: 1020, status: 'Assigned', changedAt: '2026-07-07T17:00:00', changedByUserId: 2, note: 'Assigned to Suresh Joshi' },
  { id: 52, serviceRequestId: 1020, status: 'Accepted', changedAt: '2026-07-07T17:30:00', changedByUserId: 3, note: 'Accepted' },
  { id: 53, serviceRequestId: 1020, status: 'OnTheWay', changedAt: '2026-07-08T12:30:00', changedByUserId: 3, note: 'Technician is traveling' },

  // ---- SR-1016 (Completed) ----
  { id: 55, serviceRequestId: 1016, status: 'Pending', changedAt: '2026-07-05T14:00:00', changedByUserId: 7, note: 'Request created' },
  { id: 56, serviceRequestId: 1016, status: 'Assigned', changedAt: '2026-07-05T15:00:00', changedByUserId: 2, note: 'Assigned to Ravi Kumar' },
  { id: 57, serviceRequestId: 1016, status: 'Accepted', changedAt: '2026-07-05T15:30:00', changedByUserId: 4, note: 'Accepted by Ravi' },
  { id: 58, serviceRequestId: 1016, status: 'InProgress', changedAt: '2026-07-06T11:00:00', changedByUserId: 4, note: 'Work started' },
  { id: 59, serviceRequestId: 1016, status: 'Completed', changedAt: '2026-07-06T12:30:00', changedByUserId: 4, note: 'Job completed successfully' },

  // ---- SR-1015 (Completed) ----
  { id: 60, serviceRequestId: 1015, status: 'Pending', changedAt: '2026-07-04T10:00:00', changedByUserId: 5, note: 'Request created' },
  { id: 61, serviceRequestId: 1015, status: 'Assigned', changedAt: '2026-07-04T11:00:00', changedByUserId: 2, note: 'Assigned to Deepak Verma' },
  { id: 62, serviceRequestId: 1015, status: 'Completed', changedAt: '2026-07-05T17:30:00', changedByUserId: 6, note: 'Service completed' },

  // ---- SR-1010 (Invoiced) ----
  { id: 65, serviceRequestId: 1010, status: 'Pending', changedAt: '2026-07-02T08:15:00', changedByUserId: 6, note: 'Request created' },
  { id: 66, serviceRequestId: 1010, status: 'Assigned', changedAt: '2026-07-02T09:00:00', changedByUserId: 2, note: 'Assigned to Neha Patel' },
  { id: 67, serviceRequestId: 1010, status: 'Completed', changedAt: '2026-07-03T11:00:00', changedByUserId: 4, note: 'Completed' },
  { id: 68, serviceRequestId: 1010, status: 'Invoiced', changedAt: '2026-07-03T12:00:00', changedByUserId: 2, note: 'Invoice INV-2026-106 generated' },
];
