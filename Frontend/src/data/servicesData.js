// ====================================
// Services Data Store
// ====================================
//
// Centralized mock database for available service types.
// Prices and durations are stored as clean numbers.
//
// ====================================

export const servicesData = [
  {
    id: 1,
    name: 'AC Repair',
    category: 'Air Conditioning',
    shortDescription: 'Diagnosis and repair for cooling, noise, leakage, and electrical issues.',
    startingPrice: 499,
    estimatedDurationMinutes: 90,
    estimatedDurationLabel: '60–90 min',
    isActive: true,
    isPopular: true,
    whatsIncluded: [
      'Comprehensive cooling unit inspection',
      'Gas leakage detection and fix diagnosis',
      'Electrical socket and connection checking',
      'Diagnostic report with estimated repair costs'
    ]
  },
  {
    id: 2,
    name: 'AC Cleaning',
    category: 'Air Conditioning',
    shortDescription: 'Deep cleaning for filters, coils, airflow, and cooling performance.',
    startingPrice: 699,
    estimatedDurationMinutes: 60,
    estimatedDurationLabel: '45–60 min',
    isActive: true,
    isPopular: false,
    whatsIncluded: [
      'Air filter cleaning and disinfection',
      'Indoor unit coil wash and debris removal',
      'Outdoor unit pressure cleaning',
      'Drain line clearing and airflow verification'
    ]
  },
  {
    id: 3,
    name: 'Washing Machine Repair',
    category: 'Appliance Repair',
    shortDescription: 'Inspection and repair for drainage, spinning, vibration, and power issues.',
    startingPrice: 449,
    estimatedDurationMinutes: 120,
    estimatedDurationLabel: '60–120 min',
    isActive: true,
    isPopular: true,
    whatsIncluded: [
      'Drum and motor functionality checking',
      'Drainage pump and filter inspection',
      'Suspension springs and belt alignment check',
      'Basic electrical wiring diagnostic'
    ]
  },
  {
    id: 4,
    name: 'Refrigerator Repair',
    category: 'Appliance Repair',
    shortDescription: 'Diagnosis and repair for cooling failures, compressor issues, and leaks.',
    startingPrice: 549,
    estimatedDurationMinutes: 90,
    estimatedDurationLabel: '60–90 min',
    isActive: true,
    isPopular: false,
    whatsIncluded: [
      'Compressor load and start relay test',
      'Thermostat and defrost cycle checks',
      'Internal gas flow and leaks inspection',
      'Door seal alignment and gasket check'
    ]
  },
  {
    id: 5,
    name: 'CCTV Installation',
    category: 'Security',
    shortDescription: 'Professional camera installation, configuration, and connectivity setup.',
    startingPrice: 1499,
    estimatedDurationMinutes: 240,
    estimatedDurationLabel: '2–4 hours',
    isActive: true,
    isPopular: false,
    whatsIncluded: [
      'Camera mounting on optimized visual angles',
      'Power and coaxial/Ethernet cable routing',
      'DVR/NVR configuration and storage setup',
      'Mobile app remote viewing configuration'
    ]
  },
  {
    id: 6,
    name: 'Electrical Service',
    category: 'Electrical',
    shortDescription: 'Troubleshooting and repair for switches, wiring, sockets, and power issues.',
    startingPrice: 399,
    estimatedDurationMinutes: 90,
    estimatedDurationLabel: '45–90 min',
    isActive: true,
    isPopular: false,
    whatsIncluded: [
      'Switchboard defect checking and replacements',
      'Short circuit or fuse trip diagnostic',
      'New appliance socket wiring setup',
      'Earth wire and voltage load testing'
    ]
  },
  {
    id: 7,
    name: 'Plumbing Service',
    category: 'Plumbing',
    shortDescription: 'Repair for leaks, taps, drainage, fittings, and common plumbing problems.',
    startingPrice: 349,
    estimatedDurationMinutes: 90,
    estimatedDurationLabel: '45–90 min',
    isActive: true,
    isPopular: false,
    whatsIncluded: [
      'Tap, faucet, and washbasin leakage repairs',
      'Blocked drain clearing and siphonic check',
      'Water meter, valve, and pipe inspections',
      'Sanitary fitting repair and thread sealing'
    ]
  },
  {
    id: 8,
    name: 'Water Purifier Service',
    category: 'Plumbing',
    shortDescription: 'Filter replacements, TDS adjustments, and sanitization of drinking water systems.',
    startingPrice: 499,
    estimatedDurationMinutes: 60,
    estimatedDurationLabel: '45–60 min',
    isActive: true,
    isPopular: false,
    whatsIncluded: [
      'Pre-filter and sediment candle check',
      'Carbon filter and RO membrane flushing',
      'Sanitization of the storage tank',
      'TDS output level check and adjustment'
    ]
  }
];

export const categories = [
  'All Services',
  'Air Conditioning',
  'Appliance Repair',
  'Security',
  'Electrical',
  'Plumbing'
];
