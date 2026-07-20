import React from 'react';

const statusMap = {
  Pending: { label: 'Pending', className: 'badge--pending' },
  UnderReview: { label: 'Under Review', className: 'badge--under-review' },
  Assigned: { label: 'Assigned', className: 'badge--assigned' },
  Accepted: { label: 'Accepted', className: 'badge--accepted' },
  OnTheWay: { label: 'On The Way', className: 'badge--on-the-way' },
  InProgress: { label: 'In Progress', className: 'badge--in-progress' },
  WorkCompleted: { label: 'Work Completed', className: 'badge--under-review' }, // awaiting review
  Completed: { label: 'Completed', className: 'badge--completed' },
  Invoiced: { label: 'Invoiced', className: 'badge--invoiced' },
  PaymentDone: { label: 'Payment Done', className: 'badge--payment-done' },
  Paid: { label: 'Paid', className: 'badge--completed' },
  Closed: { label: 'Closed', className: 'badge--closed' },
  Cancelled: { label: 'Cancelled', className: 'badge--cancelled' }
};

function StatusBadge({ status }) {
  // Normalize the status string to match map keys (handling spaces/casing)
  const key = Object.keys(statusMap).find(
    (k) => k.toLowerCase() === status?.replace(/\s+/g, '').toLowerCase()
  ) || 'Pending';

  const config = statusMap[key] || { label: status, className: 'badge--pending' };

  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}

export default StatusBadge;
