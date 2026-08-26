// ====================================
// Users Data Store
// ====================================
//
// Central demo user database. These match the login demo accounts.
//
// IMPORTANT — Future Security Note:
// In production, the ASP.NET Core backend will manage users via
// Identity + JWT. The frontend will never store passwords or
// user lists. This file exists only for demo purposes.
//
// ====================================

export const usersData = [
  {
    id: 1,
    firstName: 'Arjun',
    lastName: 'Mehta',
    email: 'arjun.mehta@example.com',
    phoneNumber: '9876543210',
    role: 'Customer',
    isActive: true
  },
  {
    id: 2,
    firstName: 'Aniruddh',
    lastName: 'Parmar',
    email: 'owner@fieldservice.demo',
    phoneNumber: '9876500000',
    role: 'Owner',
    isActive: true
  },
  {
    id: 3,
    firstName: 'Kavya',
    lastName: 'Sharma',
    email: 'manager@fieldservice.demo',
    phoneNumber: '9876500002',
    role: 'Manager',
    isActive: true
  },
  {
    id: 4,
    firstName: 'Ravi',
    lastName: 'Kumar',
    email: 'ravi.kumar@fieldservice.demo',
    phoneNumber: '9876500001',
    role: 'Technician',
    isActive: true
  },
  // Additional customers for realistic multi-customer data
  {
    id: 5,
    firstName: 'Rahul',
    lastName: 'Patel',
    email: 'rahul.patel@example.com',
    phoneNumber: '9876543220',
    role: 'Customer',
    isActive: true
  },
  {
    id: 6,
    firstName: 'Priya',
    lastName: 'Shah',
    email: 'priya.shah@example.com',
    phoneNumber: '9876543230',
    role: 'Customer',
    isActive: true
  },
  {
    id: 7,
    firstName: 'Mehul',
    lastName: 'Desai',
    email: 'mehul.desai@example.com',
    phoneNumber: '9876543240',
    role: 'Customer',
    isActive: true
  },
  {
    id: 8,
    firstName: 'Tech',
    lastName: 'One',
    email: 'tech1@gmail.com',
    phoneNumber: '9876500005',
    role: 'Technician',
    isActive: true
  }
];
