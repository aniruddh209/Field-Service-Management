// ====================================
// Technicians Data Store
// ====================================
//
// Centralized mock database for field technicians.
// userId links to usersData for login mapping.
// Ravi Kumar (id:1) maps to user id:4 for technician login.
//
// ====================================

export const techniciansData = [
  {
    id: 1,
    userId: 4, // Maps to Ravi Kumar in usersData
    employeeCode: 'TECH-001',
    firstName: 'Ravi',
    lastName: 'Kumar',
    email: 'ravi.kumar@fieldservice.demo',
    phoneNumber: '9876500001',
    specialization: 'Air Conditioning',
    employmentStatus: 'Active',
    activeJobCount: 2,
    rating: 4.8,
    isActive: true
  },
  {
    id: 2,
    userId: null, // No login account — managed by Owner/Manager only
    employeeCode: 'TECH-002',
    firstName: 'Amit',
    lastName: 'Singh',
    email: 'amit.singh@fieldservice.demo',
    phoneNumber: '9876500003',
    specialization: 'Security Systems',
    employmentStatus: 'Active',
    activeJobCount: 2,
    rating: 4.6,
    isActive: true
  },
  {
    id: 3,
    userId: null,
    employeeCode: 'TECH-003',
    firstName: 'Suresh',
    lastName: 'Joshi',
    email: 'suresh.joshi@fieldservice.demo',
    phoneNumber: '9876500004',
    specialization: 'Electrical Services',
    employmentStatus: 'Active',
    activeJobCount: 1,
    rating: 4.7,
    isActive: true
  },
  {
    id: 4,
    userId: null,
    employeeCode: 'TECH-004',
    firstName: 'Neha',
    lastName: 'Patel',
    email: 'neha.patel@fieldservice.demo',
    phoneNumber: '9876500005',
    specialization: 'Appliance Repair',
    employmentStatus: 'Active',
    activeJobCount: 1,
    rating: 4.9,
    isActive: true
  },
  {
    id: 5,
    userId: null,
    employeeCode: 'TECH-005',
    firstName: 'Imran',
    lastName: 'Sheikh',
    email: 'imran.sheikh@fieldservice.demo',
    phoneNumber: '9876500006',
    specialization: 'Plumbing Services',
    employmentStatus: 'On Leave',
    activeJobCount: 0,
    rating: 4.5,
    isActive: true
  },
  {
    id: 6,
    userId: null,
    employeeCode: 'TECH-006',
    firstName: 'Deepak',
    lastName: 'Verma',
    email: 'deepak.verma@fieldservice.demo',
    phoneNumber: '9876500007',
    specialization: 'Plumbing Services',
    employmentStatus: 'Active',
    activeJobCount: 0,
    rating: 4.4,
    isActive: true
  }
];
