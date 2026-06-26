import { jsPDF } from 'jspdf';
import { CalculationResult, MortgageInputs } from '../types';
import { formatDate, formatCurrency } from './calculator';

export async function exportToPDF(result: CalculationResult, inputs: MortgageInputs) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Page Width constant: 210mm for A4. Printable bounds are 14mm margin left and right = 182mm wide
  const marginX = 14;

  // Title / Logo Accent
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(16, 124, 65); // Emerald green
  doc.text('Mortgage Amortization Report', marginX, 20);

  // Date and Metadata
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 400
  const today = new Date().toISOString().split('T')[0];
  doc.text(`Generated on: ${formatDate(today)}`, marginX, 26);
  doc.text(
    `Original Term: ${inputs.loanTermYears} Years  |  Frequency: ${inputs.biweekly ? 'Biweekly' : 'Monthly'}`,
    marginX,
    31
  );

  // Horizontal divider
  doc.setDrawColor(241, 245, 249); // Slate 100
  doc.line(marginX, 35, 196, 35);

  // Loan Summary Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('Loan Summary & Calculations', marginX, 43);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85); // Slate 700

  // Left Column
  doc.text(`Home Purchase Price:  ${formatCurrency(inputs.homePrice)}`, marginX, 51);
  let downPayment = 0;
  if (inputs.downPaymentType === 'percentage') {
    downPayment = (inputs.downPaymentValue / 100) * inputs.homePrice;
  } else {
    downPayment = inputs.downPaymentValue;
  }
  downPayment = Math.min(downPayment, inputs.homePrice);
  
  const percentageStr = inputs.downPaymentType === 'percentage' 
    ? `${inputs.downPaymentValue}%` 
    : `${((downPayment / inputs.homePrice) * 100 || 0).toFixed(1)}%`;
  
  doc.text(`Down Payment:              ${formatCurrency(downPayment)} (${percentageStr})`, marginX, 57);
  doc.text(`Base Loan Amount:          ${formatCurrency(inputs.homePrice - downPayment)}`, marginX, 63);
  doc.text(`Annual Interest Rate:      ${inputs.interestRate}%`, marginX, 69);

  // Right Column
  const rightColX = 110;
  doc.text(`Payoff Term:                 ${result.payoffTermYears.toFixed(1)} Years`, rightColX, 51);
  doc.text(`Total Interest Paid:         ${formatCurrency(result.totalInterest)}`, rightColX, 57);
  doc.text(
    `Total Escrow & HOA:          ${formatCurrency(result.totalTax + result.totalInsurance + result.totalPMI + result.totalHOA)}`,
    rightColX,
    63
  );
  doc.text(`Total Lifetime Cost:         ${formatCurrency(result.totalPaid)}`, rightColX, 69);

  // Savings Highlight Banner (if prepayments made and interest saved)
  let nextY = 75;
  if (result.interestSaved > 1 || result.yearsSaved > 0.05) {
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.rect(marginX, 75, 182, 14, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(4, 120, 87); // Emerald 700
    doc.setFontSize(9);
    doc.text(
      `Savings Acceleration achieved! By making extra prepayments, you save ${formatCurrency(result.interestSaved)} in lifetime interest charges and shorten your payoff timeline by ${result.yearsSaved.toFixed(1)} years!`,
      17,
      83,
      { maxWidth: 176 }
    );
    nextY = 94;
  }

  // Payment Breakdown Summary Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.rect(marginX, nextY, 182, 22, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('Payment Schedule Breakdown', 18, nextY + 6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate 600
  const firstP = result.schedule[0];
  if (firstP) {
    const firstOther = firstP.tax + firstP.insurance + firstP.pmi + firstP.hoa;
    doc.text(`• Base P&I: ${formatCurrency(result.monthlyPI)}`, 18, nextY + 13);
    doc.text(`• Extra Principal Pmt: ${formatCurrency(firstP.extraPayment)}`, 74, nextY + 13);
    doc.text(`• Taxes & HOA Escrow: ${formatCurrency(firstOther)}`, 134, nextY + 13);
    doc.text(`Estimated total per scheduled payment period: ${formatCurrency(firstP.totalPayment)}`, 18, nextY + 18);
  } else {
    doc.text('No scheduled payments calculated.', 18, nextY + 13);
  }

  // Table Title
  const tableTitleY = nextY + 30;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Amortization Schedule (First 60 Payments)', marginX, tableTitleY);

  // Dynamic import of jspdf-autotable to prevent builder bundling mismatches
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = (autoTableModule.default || autoTableModule) as any;

  // Slice schedule to show only first 60 rows for print layout neatness
  const rowsToExport = result.schedule.slice(0, 60);
  const tableBody = rowsToExport.map((period) => [
    period.paymentNumber,
    formatDate(period.date),
    formatCurrency(period.regularPayment),
    formatCurrency(period.principal),
    formatCurrency(period.interest),
    period.extraPayment > 0 ? formatCurrency(period.extraPayment) : '—',
    formatCurrency(period.tax + period.insurance + period.pmi + period.hoa),
    formatCurrency(period.totalPayment),
    formatCurrency(period.remainingBalance),
  ]);

  // Execute jspdf-autotable utilizing the module callback
  autoTable(doc, {
    startY: tableTitleY + 4,
    head: [[
      'Pmt #',
      'Date',
      'Regular',
      'Principal',
      'Interest',
      'Extra Pmt',
      'Other Cost',
      'Total Paid',
      'Remaining Balance'
    ]],
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5, halign: 'right' },
    columnStyles: {
      0: { halign: 'center', width: 12 },
      1: { halign: 'left', width: 22 },
    },
    headStyles: {
      fillColor: [16, 124, 65], // Emerald green
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // If truncated, print warning note below table or on next page depending on vertical overflow
  if (result.schedule.length > 60) {
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Note: The amortization table was truncated to the first 60 rows in this PDF export for print layout optimization. The full schedule is available in the exported CSV.',
      marginX,
      finalY + 8,
      { maxWidth: 182 }
    );
  }

  // Save the generated document
  doc.save('mortgage_amortization_report.pdf');
}
