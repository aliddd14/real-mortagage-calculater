import React from 'react';
import { Clock, TrendingDown, Coins, Shield, HelpCircle } from 'lucide-react';
import { CalculationResult } from '../types';

interface MortgageResultsProps {
  result: CalculationResult;
  isBiweekly: boolean;
}

export default function MortgageResults({ result, isBiweekly }: MortgageResultsProps) {
  const {
    monthlyPI,
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
    interestSaved,
    yearsSaved,
    schedule,
  } = result;

  // Formatting helpers
  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  };

  // Get initial payment structure details
  const firstPeriod = schedule[0] || { tax: 0, insurance: 0, pmi: 0, hoa: 0, extraPayment: 0 };
  const firstPeriodEscrowTotal = firstPeriod.tax + firstPeriod.insurance + firstPeriod.pmi + firstPeriod.hoa;
  const firstPeriodGrandTotal = monthlyPI + firstPeriod.extraPayment + firstPeriodEscrowTotal;

  return (
    <div className="space-y-5 select-none font-sans">
      {/* 1. HERO - STANDARD LOAN RESUME CARD */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className="inline-block bg-[#F3F4F6] text-[#374151] px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
              {isBiweekly ? 'BIWEEKLY' : 'MONTHLY'} PRINCIPAL & INTEREST
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#111827] tracking-tight mt-2.5">
              {formatCurrency(monthlyPI)}
            </h2>
            <p className="text-[12px] text-[#6B7280] mt-1.5">
              Base loan payment. Escrow fees are added below.
            </p>
          </div>
          
          <div className="text-left sm:text-right">
            <span className="block text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
              ESTIMATED FIRST PAYMENT
            </span>
            <span className="block text-2xl font-semibold text-[#111827] mt-1">
              {formatCurrency(firstPeriodGrandTotal)}
            </span>
            <span className="block text-[11px] text-[#6B7280] mt-0.5">
              Including P&I, extra, & escrow
            </span>
          </div>
        </div>

        {/* Dynamic breakdown progress bar */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#374151]">
            Estimated Initial Payment Breakdown
          </h4>
          <div className="h-2.5 w-full rounded-full bg-[#F3F4F6] overflow-hidden flex">
            {/* P&I bar */}
            <div
              style={{ width: `${(monthlyPI / firstPeriodGrandTotal) * 100}%` }}
              className="bg-[#111827]"
              title={`P&I: ${formatCurrency(monthlyPI)}`}
            />
            {/* Extra principal bar */}
            {firstPeriod.extraPayment > 0 && (
              <div
                style={{ width: `${(firstPeriod.extraPayment / firstPeriodGrandTotal) * 100}%` }}
                className="bg-[#9CA3AF]"
                title={`Extra: ${formatCurrency(firstPeriod.extraPayment)}`}
              />
            )}
            {/* Escrow/Other bar */}
            <div
              style={{ width: `${(firstPeriodEscrowTotal / firstPeriodGrandTotal) * 100}%` }}
              className="bg-[#E5E7EB]"
              title={`Escrow: ${formatCurrency(firstPeriodEscrowTotal)}`}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-[#4B5563] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#111827] inline-block" />
              <span>P&I: <strong className="text-[#111827]">{formatCurrency(monthlyPI)}</strong></span>
            </div>
            {firstPeriod.extraPayment > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF] inline-block" />
                <span>Extra: <strong className="text-[#111827]">{formatCurrency(firstPeriod.extraPayment)}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB] inline-block border border-neutral-300" />
              <span>Escrow & Other: <strong className="text-[#111827]">{formatCurrency(firstPeriodEscrowTotal)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI GRID - CLEAN TWO-COLUMN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* KPI 1: Term */}
        <div className="bg-white p-4 border border-[#E5E7EB] rounded-2xl flex items-start gap-3.5 shadow-sm">
          <div className="p-2 bg-[#F9FAFB] text-[#111827] rounded-xl border border-[#E5E7EB] shrink-0">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
              Payoff Term
            </span>
            <span className="block text-xl font-semibold text-[#111827]">
              {payoffTermYears.toFixed(1)} Years
            </span>
            <span className="block text-[11px] text-[#6B7280]">
              {payoffTermPeriods} periodic payments made
            </span>
            {yearsSaved > 0.05 && (
              <span className="inline-flex items-center mt-1.5 bg-[#111827] text-white text-[9px] font-medium px-2 py-0.5 rounded-lg uppercase tracking-wider">
                Saved {yearsSaved.toFixed(1)} Years
              </span>
            )}
          </div>
        </div>

        {/* KPI 2: Interest */}
        <div className="bg-white p-4 border border-[#E5E7EB] rounded-2xl flex items-start gap-3.5 shadow-sm">
          <div className="p-2 bg-[#F9FAFB] text-[#111827] rounded-xl border border-[#E5E7EB] shrink-0">
            <TrendingDown className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
              Total Interest Paid
            </span>
            <span className="block text-xl font-semibold text-[#111827]">
              {formatCurrency(totalInterest)}
            </span>
            <span className="block text-[11px] text-[#6B7280]">
              Ratio: {((totalInterest / totalPrincipal) * 100 || 0).toFixed(1)}% of loan size
            </span>
            {interestSaved > 1 && (
              <span className="inline-flex items-center mt-1.5 bg-[#F3F4F6] text-[#111827] border border-[#E5E7EB] text-[9px] font-medium px-2 py-0.5 rounded-lg uppercase tracking-wider">
                Saved {formatCurrency(interestSaved)}
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Principal & Prepayments */}
        <div className="bg-white p-4 border border-[#E5E7EB] rounded-2xl flex items-start gap-3.5 shadow-sm">
          <div className="p-2 bg-[#F9FAFB] text-[#111827] rounded-xl border border-[#E5E7EB] shrink-0">
            <Coins className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
              Principal Paid
            </span>
            <span className="block text-xl font-semibold text-[#111827]">
              {formatCurrency(totalPrincipal)}
            </span>
            <span className="block text-[11px] text-[#6B7280]">
              Base: {formatCurrency(totalPrincipal - totalExtraPaid)}
            </span>
            {totalExtraPaid > 0 && (
              <span className="inline-flex items-center mt-1.5 bg-[#111827] text-white text-[9px] font-medium px-2 py-0.5 rounded-lg uppercase tracking-wider">
                Extras: {formatCurrency(totalExtraPaid)}
              </span>
            )}
          </div>
        </div>

        {/* KPI 4: Escrow & Indirect Fees */}
        <div className="bg-white p-4 border border-[#E5E7EB] rounded-2xl flex items-start gap-3.5 shadow-sm">
          <div className="p-2 bg-[#F9FAFB] text-[#111827] rounded-xl border border-[#E5E7EB] shrink-0">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
              Total Escrow Costs
            </span>
            <span className="block text-xl font-semibold text-[#111827]">
              {formatCurrency(totalTax + totalInsurance + totalPMI + totalHOA)}
            </span>
            <div className="text-[10px] text-[#6B7280] space-y-0.5 mt-0.5">
              <div className="flex justify-between gap-4">
                <span>Tax:</span> <span>{formatCurrency(totalTax)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Insurance:</span> <span>{formatCurrency(totalInsurance)}</span>
              </div>
              {totalPMI > 0 && (
                <div className="flex justify-between gap-4 text-amber-800 font-medium">
                  <span>PMI:</span> <span>{formatCurrency(totalPMI)}</span>
                </div>
              )}
              {totalHOA > 0 && (
                <div className="flex justify-between gap-4">
                  <span>HOA:</span> <span>{formatCurrency(totalHOA)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. COST OF OWNERSHIP SUMMARY BANNER */}
      <div className="bg-[#111827] text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Total Cost of Ownership (Principal + Interest + Escrow)
          </span>
          <span className="block text-2xl font-semibold text-white mt-1">
            {formatCurrency(totalPaid)}
          </span>
        </div>
        <div className="text-left sm:text-right text-[11px] text-[#9CA3AF] max-w-xs font-medium">
          Simulated cumulative expenditures including initial price, compounded rates, extra prepayments, and escalation indices over the full mortgage lifecycle.
        </div>
      </div>
    </div>
  );
}
