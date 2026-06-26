export interface MortgageInputs {
  homePrice: number;
  downPaymentValue: number;
  downPaymentType: 'percentage' | 'cash';
  interestRate: number;
  loanTermYears: number;
  startDate: string; // YYYY-MM-DD
  propertyTax: number; // annual $
  homeInsurance: number; // annual $
  pmiMonthly: number; // monthly $
  hoaMonthly: number; // monthly $
  extraMonthly: number; // monthly $
  taxEscalation: number; // annual %
  insuranceEscalation: number; // annual %
  hoaEscalation: number; // annual %
  oneTimeExtra: number; // $
  oneTimeExtraMonth: number; // month #
  annualExtra: number; // $
  annualExtraMonth: number; // month of the year (1-12)
  biweekly: boolean;
}

export interface AmortizationPeriod {
  paymentNumber: number;
  date: string;
  regularPayment: number; // P&I base
  principal: number;
  interest: number;
  extraPayment: number;
  tax: number;
  insurance: number;
  pmi: number;
  hoa: number;
  totalPayment: number; // regularPayment + extraPayment + tax + insurance + pmi + hoa
  remainingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface CalculationResult {
  monthlyPI: number; // standard P&I
  totalInterest: number;
  totalPrincipal: number;
  totalTax: number;
  totalInsurance: number;
  totalPMI: number;
  totalHOA: number;
  totalExtraPaid: number;
  totalPaid: number; // cumulative sum of all payments
  payoffTermYears: number;
  payoffTermPeriods: number; // actual payments made
  originalTermPeriods: number; // periods if no extras
  interestSaved: number;
  yearsSaved: number;
  schedule: AmortizationPeriod[];
}
