/**
 * Request Status State Transition Rules
 */

export const requestStatuses = {
  Pending: 'Pending',
  UnderReview: 'UnderReview',
  Assigned: 'Assigned',
  Accepted: 'Accepted',
  OnTheWay: 'OnTheWay',
  InProgress: 'InProgress',
  WorkCompleted: 'WorkCompleted',
  Completed: 'Completed',
  Invoiced: 'Invoiced',
  Paid: 'Paid',
  Closed: 'Closed',
  Cancelled: 'Cancelled'
}

// Maps status keys to user-friendly label names
export const statusLabels = {
  Pending: 'Pending',
  UnderReview: 'Under Review',
  Assigned: 'Assigned',
  Accepted: 'Accepted',
  OnTheWay: 'On The Way',
  InProgress: 'In Progress',
  WorkCompleted: 'Work Completed',
  Completed: 'Completed',
  Invoiced: 'Invoiced',
  Paid: 'Paid',
  Closed: 'Closed',
  Cancelled: 'Cancelled'
}

/**
 * Validates whether a state transition is allowed based on business rules and roles.
 * 
 * Rules:
 * - Pending -> UnderReview (Owner/Manager)
 * - UnderReview -> Assigned (Owner/Manager)
 * - Assigned -> Accepted (Technician)
 * - Assigned -> UnderReview (Technician rejects job assignment)
 * - Accepted -> OnTheWay (Technician)
 * - OnTheWay -> InProgress (Technician)
 * - InProgress -> WorkCompleted (Technician submits completion report)
 * - WorkCompleted -> Completed (Owner/Manager reviews and approves work report)
 * - Completed -> Invoiced (Owner/Manager generates invoice)
 * - Invoiced -> Paid (Customer simulated payment)
 * - Paid -> Closed (Owner/Manager closes request)
 * - Any active stage -> Cancelled (Owner/Manager/Customer where appropriate)
 * 
 * @param {string} currentStatus - Current state
 * @param {string} nextStatus - Targeted state
 * @param {string} role - Current logged-in user role
 * @returns {boolean} True if transition is valid
 */
export function canTransitionRequestStatus(currentStatus, nextStatus, role) {
  if (currentStatus === nextStatus) return true
  
  const isManagement = role === 'Owner' || role === 'Manager'
  const isTechnician = role === 'Technician'
  const isCustomer = role === 'Customer'

  switch (currentStatus) {
    case 'Pending':
      return nextStatus === 'UnderReview' && isManagement

    case 'UnderReview':
      return (nextStatus === 'Assigned' && isManagement) || (nextStatus === 'Cancelled' && isManagement)

    case 'Assigned':
      if (isTechnician) {
        return nextStatus === 'Accepted' || nextStatus === 'UnderReview' // Reject moves back to UnderReview
      }
      return (nextStatus === 'UnderReview' && isManagement) || (nextStatus === 'Cancelled' && isManagement)

    case 'Accepted':
      return (nextStatus === 'OnTheWay' && isTechnician) || (nextStatus === 'Cancelled' && isManagement)

    case 'OnTheWay':
      return (nextStatus === 'InProgress' && isTechnician) || (nextStatus === 'Cancelled' && isManagement)

    case 'InProgress':
      return nextStatus === 'WorkCompleted' && isTechnician

    case 'WorkCompleted':
      // Report approved -> Completed, or if returned for correction stays in WorkCompleted but changes report reviewStatus
      return (nextStatus === 'Completed' && isManagement) || (nextStatus === 'Cancelled' && isManagement)

    case 'Completed':
      return nextStatus === 'Invoiced' && isManagement

    case 'Invoiced':
      return nextStatus === 'Paid' && (isCustomer || isManagement) // customer simulated payment

    case 'Paid':
      return nextStatus === 'Closed' && isManagement

    case 'Closed':
    case 'Cancelled':
      return false // terminal states

    default:
      return false
  }
}
