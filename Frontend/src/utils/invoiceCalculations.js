/**
 * Invoice Mathematical Calculation Utilities
 */

/**
 * Calculates subtotals, discounts, taxes, and grand totals for invoices.
 * 
 * Formula:
 * - Parts Total = Sum(part.quantity * part.unitPrice)
 * - Additional Charges Total = Sum(charge.amount)
 * - Subtotal = Service Charge + Labour Charge + Parts Total + Additional Charges
 * - Discount Amount = If Percentage: Subtotal * (Value / 100), Else: Value
 * - Taxable Amount = Max(0, Subtotal - Discount Amount)
 * - Tax Amount = Taxable Amount * (Tax Percentage / 100)
 * - Grand Total = Taxable Amount + Tax Amount
 * 
 * @param {Object} data - Form or invoice data parameters
 * @returns {Object} Calculated invoice breakdown
 */
export function calculateInvoiceBreakdown(data) {
  const serviceCharge = Number(data.serviceCharge || 0);
  const labourCharge = Number(data.labourCharge || 0);
  
  // Calculate parts sum
  const partsTotal = (data.parts || []).reduce(
    (sum, p) => sum + (Number(p.quantity || 0) * Number(p.unitPrice || 0)), 
    0
  );
  
  // Calculate additional charges sum
  const additionalTotal = (data.additionalCharges || []).reduce(
    (sum, c) => sum + Number(c.amount || 0), 
    0
  );
  
  const subtotal = serviceCharge + labourCharge + partsTotal + additionalTotal;
  
  // Calculate discount
  let discountAmount = 0;
  const discountValue = Number(data.discountValue || 0);
  if (data.discountType === 'Percentage') {
    discountAmount = Math.round(subtotal * (discountValue / 100));
  } else {
    discountAmount = discountValue;
  }
  
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  
  // Calculate tax
  const taxPercentage = Number(data.taxPercentage || 0);
  const taxAmount = Math.round(taxableAmount * (taxPercentage / 100));
  
  const grandTotal = taxableAmount + taxAmount;
  
  return {
    partsTotal,
    additionalTotal,
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    grandTotal
  };
}
