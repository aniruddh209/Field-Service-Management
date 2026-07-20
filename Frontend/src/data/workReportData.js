// ====================================
// Work Reports Mock Data Store
// ====================================
//
// Mock reports submitted by technicians on completion of service.
// References serviceRequestId from serviceRequestsData.
//
// ====================================

export const workReportData = [
  {
    id: 1,
    serviceRequestId: 1016, // Refrigerator Repair completed by Ravi Kumar
    technicianId: 1, // Ravi Kumar
    technicianName: 'Ravi Kumar',
    diagnosis: 'Defrost heater failed, causing ice build-up in freezer compartment.',
    workPerformed: 'Replaced defrost heating element, defrosted evaporator coil manually, checked drainage line, and verified thermostat cycles.',
    labourDescription: 'Evaporator defrosting and heating element assembly replacement.',
    labourHours: 1.8,
    suggestedLabourCharge: 950,
    partsUsed: [
      {
        partId: 10,
        partName: 'Defrost Heater Element',
        quantity: 1,
        unit: 'Piece',
        suggestedUnitPrice: 850
      }
    ],
    beforePhotos: [],
    afterPhotos: [],
    resolution: 'Evaporator defrost heater replaced; cooling and air circulation restored to optimal levels.',
    technicianNotes: 'Advised customer to keep freezer door tightly closed and monitor defrost cycles for 2 days.',
    warrantyRecommended: true,
    recommendedWarrantyDays: 90,
    submittedAt: '2026-07-06T12:00:00',
    reviewStatus: 'Approved',
    correctionNotes: ''
  }
];
