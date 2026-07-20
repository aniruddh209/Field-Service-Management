// ====================================
// Customer Assets Data Store
// ====================================
//
// Centralized mock database for equipment/assets owned by customers.
// Matches DTO-like shape.
//
// ====================================

export const assetsData = [
  {
    id: 1,
    customerId: 1, // Arjun Mehta
    name: 'Living Room AC',
    category: 'Air Conditioner',
    brand: 'LG',
    model: 'PS-Q19YNZE',
    serialNumber: 'LGAC202400123',
    purchaseDate: '2024-03-12',
    warrantyUntil: '2029-03-11',
    addressId: 1, // Home
    isActive: true
  },
  {
    id: 2,
    customerId: 1, // Arjun Mehta
    name: 'Samsung Washing Machine',
    category: 'Washing Machine',
    brand: 'Samsung',
    model: 'WA70BG4441BY',
    serialNumber: 'SAMSWM987654',
    purchaseDate: '2023-08-20',
    warrantyUntil: '2025-08-19',
    addressId: 1, // Home
    isActive: true
  },
  {
    id: 3,
    customerId: 1, // Arjun Mehta
    name: 'Office CCTV System',
    category: 'CCTV Security',
    brand: 'Hikvision',
    model: 'DS-7208HUHI-K1',
    serialNumber: 'HIKV88771122',
    purchaseDate: '2025-01-10',
    warrantyUntil: '2027-01-09',
    addressId: 2, // Office
    isActive: true
  },
  {
    id: 4,
    customerId: 1, // Arjun Mehta
    name: 'Kitchen Water Purifier',
    category: 'Water Purifier',
    brand: 'Kent',
    model: 'Grand Plus RO',
    serialNumber: 'KENTWP112233',
    purchaseDate: '2024-05-15',
    warrantyUntil: '2026-05-14',
    addressId: 1, // Home
    isActive: true
  }
];
