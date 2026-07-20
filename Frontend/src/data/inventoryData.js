// ====================================
// Inventory Data Store
// ====================================
//
// Centralized mock database for spare parts / inventory items.
// Used by Management → Inventory page and Technician → Parts Used.
//
// Stock states logic:
//   quantityInStock === 0        → Out of Stock
//   quantityInStock <= reorderLevel → Low Stock
//   otherwise                    → In Stock
//
// ====================================

export const inventoryData = [
  {
    id: 1,
    sku: 'PART-AC-001',
    name: 'AC Capacitor 35uF',
    category: 'AC Parts',
    quantityInStock: 4,
    reorderLevel: 6,
    unitPrice: 450,
    isActive: true
  },
  {
    id: 2,
    sku: 'PART-AC-002',
    name: 'Copper Pipe 1/4 inch (per meter)',
    category: 'AC Parts',
    quantityInStock: 12,
    reorderLevel: 5,
    unitPrice: 280,
    isActive: true
  },
  {
    id: 3,
    sku: 'PART-AC-003',
    name: 'Copper Pipe 1/2 inch (per meter)',
    category: 'AC Parts',
    quantityInStock: 8,
    reorderLevel: 5,
    unitPrice: 350,
    isActive: true
  },
  {
    id: 4,
    sku: 'PART-PLB-001',
    name: 'PVC Elbow 1/2 inch',
    category: 'Plumbing Parts',
    quantityInStock: 25,
    reorderLevel: 10,
    unitPrice: 35,
    isActive: true
  },
  {
    id: 5,
    sku: 'PART-ELC-001',
    name: 'MCB 16A Single Pole',
    category: 'Electrical Parts',
    quantityInStock: 3,
    reorderLevel: 5,
    unitPrice: 320,
    isActive: true
  },
  {
    id: 6,
    sku: 'PART-ELC-002',
    name: 'Electrical Wire 2.5mm (per meter)',
    category: 'Electrical Parts',
    quantityInStock: 50,
    reorderLevel: 20,
    unitPrice: 45,
    isActive: true
  },
  {
    id: 7,
    sku: 'PART-CCTV-001',
    name: 'CCTV BNC Connector',
    category: 'CCTV Parts',
    quantityInStock: 18,
    reorderLevel: 10,
    unitPrice: 25,
    isActive: true
  },
  {
    id: 8,
    sku: 'PART-CCTV-002',
    name: 'CCTV Power Adapter 12V 2A',
    category: 'CCTV Parts',
    quantityInStock: 2,
    reorderLevel: 4,
    unitPrice: 550,
    isActive: true
  },
  {
    id: 9,
    sku: 'PART-WP-001',
    name: 'RO Filter Cartridge',
    category: 'Water Purifier Parts',
    quantityInStock: 6,
    reorderLevel: 4,
    unitPrice: 750,
    isActive: true
  },
  {
    id: 10,
    sku: 'PART-WM-001',
    name: 'Washing Machine Drain Pump',
    category: 'Appliance Parts',
    quantityInStock: 0,
    reorderLevel: 3,
    unitPrice: 1200,
    isActive: true
  },
  {
    id: 11,
    sku: 'PART-RF-001',
    name: 'Refrigerator Thermostat',
    category: 'Appliance Parts',
    quantityInStock: 3,
    reorderLevel: 3,
    unitPrice: 850,
    isActive: true
  },
  {
    id: 12,
    sku: 'PART-AC-004',
    name: 'AC Contactor 1.5 Ton',
    category: 'AC Parts',
    quantityInStock: 5,
    reorderLevel: 4,
    unitPrice: 680,
    isActive: true
  }
];
