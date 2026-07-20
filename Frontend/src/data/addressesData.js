// ====================================
// Customer Addresses Data Store
// ====================================
//
// Centralized mock database for customer addresses.
// Matches DTO-like shape.
//
// ====================================

export const addressesData = [
  {
    id: 1,
    customerId: 1, // Arjun Mehta
    label: 'Home',
    contactName: 'Arjun Mehta',
    phoneNumber: '9876543210',
    addressLine1: '102, Shree Residency',
    addressLine2: 'Near Crystal Mall, Kalawad Road',
    city: 'Rajkot',
    state: 'Gujarat',
    postalCode: '360005',
    landmark: 'Opposite Crystal Mall',
    isDefault: true
  },
  {
    id: 2,
    customerId: 1, // Arjun Mehta
    label: 'Office',
    contactName: 'Arjun Mehta (Corp)',
    phoneNumber: '9876543211',
    addressLine1: '304, Imperial Heights',
    addressLine2: '150 Feet Ring Road',
    city: 'Rajkot',
    state: 'Gujarat',
    postalCode: '360007',
    landmark: 'Behind Big Bazaar',
    isDefault: false
  },
  {
    id: 3,
    customerId: 1, // Arjun Mehta
    label: "Parents' Home",
    contactName: 'Ramesh Mehta',
    phoneNumber: '9876543212',
    addressLine1: 'B-45, Shanti Kunj',
    addressLine2: 'University Road',
    city: 'Rajkot',
    state: 'Gujarat',
    postalCode: '360005',
    landmark: 'Near Saurashtra University Gate',
    isDefault: false
  }
];
