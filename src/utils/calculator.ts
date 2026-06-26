import { MortgageInputs, AmortizationPeriod, CalculationResult } from '../types';

/**
 * Formats a date string in YYYY-MM-DD format deterministically to "MMM D, YYYY"
 * without relying on toLocaleDateString to prevent server/client hydration mismatches.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  if (monthNum >= 1 && monthNum <= 12) {
    return `${monthNames[monthNum - 1]} ${day}, ${year}`;
  }
  return dateStr;
}

/**
 * Deterministically gets the date for a given monthly offset from the start date.
 */
export function getNextMonthDate(startDateStr: string, monthOffset: number): string {
  if (!startDateStr) return '';
  const parts = startDateStr.split('-');
  if (parts.length < 3) return startDateStr;
  
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10); // 1-12
  const day = parseInt(parts[2], 10);
  
  month += monthOffset;
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
}

/**
 * Deterministically gets the date for a given biweekly offset from the start date.
 */
export function getNextBiweeklyDate(startDateStr: string, periodIndex: number): string {
  if (!startDateStr) return '';
  const parts = startDateStr.split('-');
  if (parts.length < 3) return startDateStr;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  // Create UTC date to avoid local timezone variances
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + (periodIndex * 14));
  
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = date.getUTCDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a number as USD currency.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Performs full mortgage amortization calculation based on user inputs.
 */
export function calculateMortgage(inputs: MortgageInputs): CalculationResult {
  const {
    homePrice,
    downPaymentValue,
    downPaymentType,
    interestRate,
    loanTermYears,
    startDate,
    propertyTax,
    homeInsurance,
    pmiMonthly,
    hoaMonthly,
    extraMonthly,
    taxEscalation,
    insuranceEscalation,
    hoaEscalation,
    oneTimeExtra,
    oneTimeExtraMonth,
    annualExtra,
    annualExtraMonth,
    biweekly,
  } = inputs;

  // 1. Calculate Down Payment and Loan Amount
  let downPayment = 0;
  if (downPaymentType === 'percentage') {
    downPayment = (downPaymentValue / 100) * homePrice;
  } else {
    downPayment = downPaymentValue;
  }
  downPayment = Math.min(downPayment, homePrice);
  const loanAmount = Math.max(0, homePrice - downPayment);

  // 2. Base monthly P&I calculation for baseline comparisons
  const N_baseline = loanTermYears * 12;
  const r_baseline = (interestRate / 100) / 12;
  let monthlyPI_baseline = 0;
  if (loanAmount > 0) {
    if (interestRate === 0) {
      monthlyPI_baseline = loanAmount / N_baseline;
    } else {
      monthlyPI_baseline = (loanAmount * r_baseline * Math.pow(1 + r_baseline, N_baseline)) / 
                           (Math.pow(1 + r_baseline, N_baseline) - 1);
    }
  }

  // Calculate standard total interest with no extra payments and standard monthly frequency
  let standardTotalInterest = 0;
  if (loanAmount > 0) {
    if (interestRate === 0) {
      standardTotalInterest = 0;
    } else {
      standardTotalInterest = (monthlyPI_baseline * N_baseline) - loanAmount;
    }
  }

  // 3. Initialize scheduling loop parameters
  let currentBalance = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  
  let totalInterest = 0;
  let totalPrincipal = 0;
  let totalTax = 0;
  let totalInsurance = 0;
  let totalPMI = 0;
  let totalHOA = 0;
  let totalExtraPaid = 0;
  
  const schedule: AmortizationPeriod[] = [];

  if (loanAmount <= 0) {
    return {
      monthlyPI: 0,
      totalInterest: 0,
      totalPrincipal: 0,
      totalTax: 0,
      totalInsurance: 0,
      totalPMI: 0,
      totalHOA: 0,
      totalExtraPaid: 0,
      totalPaid: 0,
      payoffTermYears: 0,
      payoffTermPeriods: 0,
      originalTermPeriods: biweekly ? loanTermYears * 26 : loanTermYears * 12,
      interestSaved: 0,
      yearsSaved: 0,
      schedule: [],
    };
  }

  if (!biweekly) {
    // --- Monthly Schedule Calculation ---
    const monthlyInterestRate = (interestRate / 100) / 12;
    const maxPeriods = loanTermYears * 12;

    for (let periodIndex = 1; periodIndex <= maxPeriods; periodIndex++) {
      if (currentBalance < 0.01) {
        break;
      }

      const yearIndex = Math.floor((periodIndex - 1) / 12);
      
      // Additional recurring expenses with custom annual escalation rates
      const taxForPeriod = (propertyTax / 12) * Math.pow(1 + taxEscalation / 100, yearIndex);
      const insuranceForPeriod = (homeInsurance / 12) * Math.pow(1 + insuranceEscalation / 100, yearIndex);
      const hoaForPeriod = hoaMonthly * Math.pow(1 + hoaEscalation / 100, yearIndex);
      
      // PMI drops off if current balance is under 80% of original home purchase price (LTV < 80%)
      const pmiForPeriod = (currentBalance < homePrice * 0.8) ? 0 : pmiMonthly;

      // Regular P&I elements
      const interestForPeriod = interestRate > 0 ? (currentBalance * monthlyInterestRate) : 0;
      let regularPrincipal = interestRate > 0 
        ? (monthlyPI_baseline - interestForPeriod) 
        : (loanAmount / maxPeriods);
      
      regularPrincipal = Math.min(regularPrincipal, currentBalance);

      // Extra payments calculations
      let proposedExtra = extraMonthly;
      
      // One-time extra payment
      if (periodIndex === oneTimeExtraMonth) {
        proposedExtra += oneTimeExtra;
      }
      
      // Annual extra payment
      const currentMonthOfYear = ((periodIndex - 1) % 12) + 1;
      if (currentMonthOfYear === annualExtraMonth) {
        proposedExtra += annualExtra;
      }

      // Extra payments only apply to remaining balance after regular principal is deducted
      const maxExtraAllowed = Math.max(0, currentBalance - regularPrincipal);
      const extraPaymentForPeriod = Math.min(proposedExtra, maxExtraAllowed);

      const actualPrincipalPaid = regularPrincipal + extraPaymentForPeriod;
      const regularPIPaid = regularPrincipal + interestForPeriod;
      const totalPeriodCost = regularPIPaid + extraPaymentForPeriod + taxForPeriod + insuranceForPeriod + pmiForPeriod + hoaForPeriod;

      currentBalance = currentBalance - actualPrincipalPaid;
      
      cumulativeInterest += interestForPeriod;
      cumulativePrincipal += actualPrincipalPaid;

      totalInterest += interestForPeriod;
      totalPrincipal += actualPrincipalPaid;
      totalTax += taxForPeriod;
      totalInsurance += insuranceForPeriod;
      totalPMI += pmiForPeriod;
      totalHOA += hoaForPeriod;
      totalExtraPaid += extraPaymentForPeriod;

      schedule.push({
        paymentNumber: periodIndex,
        date: getNextMonthDate(startDate, periodIndex),
        regularPayment: regularPIPaid,
        principal: regularPrincipal,
        interest: interestForPeriod,
        extraPayment: extraPaymentForPeriod,
        tax: taxForPeriod,
        insurance: insuranceForPeriod,
        pmi: pmiForPeriod,
        hoa: hoaForPeriod,
        totalPayment: totalPeriodCost,
        remainingBalance: Math.max(0, currentBalance),
        cumulativeInterest,
        cumulativePrincipal,
      });
    }
  } else {
    // --- Biweekly Schedule Calculation ---
    // A biweekly mortgage has 26 periods per year.
    // Standard biweekly payment is half of the standard monthly P&I payment.
    const biweeklyInterestRate = (interestRate / 100) / 26;
    const maxPeriods = loanTermYears * 26;
    const biweeklyPI_payment = monthlyPI_baseline / 2;

    for (let periodIndex = 1; periodIndex <= maxPeriods; periodIndex++) {
      if (currentBalance < 0.01) {
        break;
      }

      const yearIndex = Math.floor((periodIndex - 1) / 26);
      
      // Standard monthly additional costs split or scaled to biweekly periods (26/year)
      const taxForPeriod = (propertyTax / 26) * Math.pow(1 + taxEscalation / 100, yearIndex);
      const insuranceForPeriod = (homeInsurance / 26) * Math.pow(1 + insuranceEscalation / 100, yearIndex);
      const hoaForPeriod = (hoaMonthly * 12 / 26) * Math.pow(1 + hoaEscalation / 100, yearIndex);
      
      // PMI drops if LTV < 80%
      const pmiForPeriod = (currentBalance < homePrice * 0.8) ? 0 : (pmiMonthly * 12 / 26);

      // Interest and base principal
      const interestForPeriod = interestRate > 0 ? (currentBalance * biweeklyInterestRate) : 0;
      let regularPrincipal = interestRate > 0
        ? (biweeklyPI_payment - interestForPeriod)
        : (loanAmount / maxPeriods);
      
      regularPrincipal = Math.min(regularPrincipal, currentBalance);

      // Extra payments calculations (scaled to biweekly)
      let proposedExtra = (extraMonthly * 12 / 26);
      
      // One-time extra month mapped to the corresponding biweekly period (using 2.167 periods/month)
      const mappedOneTimePeriod = Math.round(oneTimeExtraMonth * 2.167);
      if (periodIndex === mappedOneTimePeriod) {
        proposedExtra += oneTimeExtra;
      }

      // Annual extra payment month mapped to biweekly period index inside the year
      const currentPeriodOfYear = ((periodIndex - 1) % 26) + 1;
      const mappedAnnualPeriodInYear = Math.round(annualExtraMonth * 2.167);
      if (currentPeriodOfYear === mappedAnnualPeriodInYear) {
        proposedExtra += annualExtra;
      }

      const maxExtraAllowed = Math.max(0, currentBalance - regularPrincipal);
      const extraPaymentForPeriod = Math.min(proposedExtra, maxExtraAllowed);

      const actualPrincipalPaid = regularPrincipal + extraPaymentForPeriod;
      const regularPIPaid = regularPrincipal + interestForPeriod;
      const totalPeriodCost = regularPIPaid + extraPaymentForPeriod + taxForPeriod + insuranceForPeriod + pmiForPeriod + hoaForPeriod;

      currentBalance = currentBalance - actualPrincipalPaid;
      
      cumulativeInterest += interestForPeriod;
      cumulativePrincipal += actualPrincipalPaid;

      totalInterest += interestForPeriod;
      totalPrincipal += actualPrincipalPaid;
      totalTax += taxForPeriod;
      totalInsurance += insuranceForPeriod;
      totalPMI += pmiForPeriod;
      totalHOA += hoaForPeriod;
      totalExtraPaid += extraPaymentForPeriod;

      schedule.push({
        paymentNumber: periodIndex,
        date: getNextBiweeklyDate(startDate, periodIndex),
        regularPayment: regularPIPaid,
        principal: regularPrincipal,
        interest: interestForPeriod,
        extraPayment: extraPaymentForPeriod,
        tax: taxForPeriod,
        insurance: insuranceForPeriod,
        pmi: pmiForPeriod,
        hoa: hoaForPeriod,
        totalPayment: totalPeriodCost,
        remainingBalance: Math.max(0, currentBalance),
        cumulativeInterest,
        cumulativePrincipal,
      });
    }
  }

  // Calculate actual term in years
  const payoffTermPeriods = schedule.length;
  const periodsPerYear = biweekly ? 26 : 12;
  const payoffTermYears = payoffTermPeriods / periodsPerYear;
  
  // Calculate years saved
  const standardTermPeriods = biweekly ? loanTermYears * 26 : loanTermYears * 12;
  const yearsSaved = Math.max(0, loanTermYears - payoffTermYears);
  
  // Total calculated cost paid
  const totalPaid = totalPrincipal + totalInterest + totalTax + totalInsurance + totalPMI + totalHOA;
  
  // Interest saved compared to standard monthly schedule
  const interestSaved = Math.max(0, standardTotalInterest - totalInterest);

  return {
    monthlyPI: biweekly ? monthlyPI_baseline / 2 : monthlyPI_baseline,
    totalInterest,
    totalPrincipal,
    totalTax,
    totalInsurance,
    totalPMI,
    totalHOA,
    totalExtraPaid,
    totalPaid,
    payoffTermYears,
    payoffTermPeriods,
    originalTermPeriods: standardTermPeriods,
    interestSaved,
    yearsSaved,
    schedule,
  };
}

/**
 * Generates CSV content from the amortization schedule.
 */
export function generateCSV(schedule: AmortizationPeriod[]): string {
  const headers = [
    'Payment #',
    'Date',
    'Payment',
    'Principal',
    'Interest',
    'Extra Payment',
    'Tax',
    'Insurance',
    'PMI',
    'HOA',
    'Total Payment',
    'Remaining Balance',
    'Cumulative Interest',
    'Cumulative Principal'
  ];

  const rows = schedule.map(period => [
    period.paymentNumber,
    period.date,
    period.regularPayment.toFixed(2),
    period.principal.toFixed(2),
    period.interest.toFixed(2),
    period.extraPayment.toFixed(2),
    period.tax.toFixed(2),
    period.insurance.toFixed(2),
    period.pmi.toFixed(2),
    period.hoa.toFixed(2),
    period.totalPayment.toFixed(2),
    period.remainingBalance.toFixed(2),
    period.cumulativeInterest.toFixed(2),
    period.cumulativePrincipal.toFixed(2)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  return csvContent;
}
