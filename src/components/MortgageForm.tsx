import React, { useState, useEffect } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Switch from '@radix-ui/react-switch';
import { ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import { MortgageInputs } from '../types';

interface MortgageFormProps {
  onCalculate: (inputs: MortgageInputs) => void;
  initialInputs?: MortgageInputs;
}

export default function MortgageForm({ onCalculate, initialInputs }: MortgageFormProps) {
  // Master form inputs
  const [homePrice, setHomePrice] = useState<string>('');
  const [downPaymentCash, setDownPaymentCash] = useState<string>('');
  const [downPaymentPercent, setDownPaymentPercent] = useState<string>('');
  const [downPaymentType, setDownPaymentType] = useState<'percentage' | 'cash'>('percentage');
  const [interestRate, setInterestRate] = useState<string>('');
  const [loanTermYears, setLoanTermYears] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');

  // Additional Monthly Costs
  const [propertyTax, setPropertyTax] = useState<string>('');
  const [homeInsurance, setHomeInsurance] = useState<string>('');
  const [pmiMonthly, setPmiMonthly] = useState<string>('');
  const [hoaMonthly, setHoaMonthly] = useState<string>('');
  const [extraMonthly, setExtraMonthly] = useState<string>('');

  // Advanced Options
  const [taxEscalation, setTaxEscalation] = useState<string>('');
  const [insuranceEscalation, setInsuranceEscalation] = useState<string>('');
  const [hoaEscalation, setHoaEscalation] = useState<string>('');
  const [oneTimeExtra, setOneTimeExtra] = useState<string>('');
  const [oneTimeExtraMonth, setOneTimeExtraMonth] = useState<string>('');
  const [annualExtra, setAnnualExtra] = useState<string>('');
  const [annualExtraMonth, setAnnualExtraMonth] = useState<string>('');
  const [biweekly, setBiweekly] = useState<boolean>(false);

  // Collapsible state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Sync initial inputs or set defaults on mount
  useEffect(() => {
    if (initialInputs) {
      setHomePrice(initialInputs.homePrice ? initialInputs.homePrice.toString() : '');
      const dpType = initialInputs.downPaymentType || 'percentage';
      setDownPaymentType(dpType);
      
      const price = initialInputs.homePrice || 0;
      const dpValue = initialInputs.downPaymentValue || 0;
      
      if (dpType === 'percentage') {
        setDownPaymentPercent(dpValue.toString());
        const cash = (dpValue / 100) * price;
        setDownPaymentCash(cash > 0 ? Math.round(cash).toString() : '');
      } else {
        setDownPaymentCash(dpValue.toString());
        const pct = price > 0 ? (dpValue / price) * 100 : 0;
        setDownPaymentPercent(pct > 0 ? Number(pct.toFixed(2)).toString() : '');
      }

      setInterestRate(initialInputs.interestRate ? initialInputs.interestRate.toString() : '');
      setLoanTermYears(initialInputs.loanTermYears ? initialInputs.loanTermYears.toString() : '');
      setStartDate(initialInputs.startDate || '');
      setPropertyTax(initialInputs.propertyTax ? initialInputs.propertyTax.toString() : '');
      setHomeInsurance(initialInputs.homeInsurance ? initialInputs.homeInsurance.toString() : '');
      setPmiMonthly(initialInputs.pmiMonthly ? initialInputs.pmiMonthly.toString() : '');
      setHoaMonthly(initialInputs.hoaMonthly ? initialInputs.hoaMonthly.toString() : '');
      setExtraMonthly(initialInputs.extraMonthly ? initialInputs.extraMonthly.toString() : '');
      setTaxEscalation(initialInputs.taxEscalation ? initialInputs.taxEscalation.toString() : '');
      setInsuranceEscalation(initialInputs.insuranceEscalation ? initialInputs.insuranceEscalation.toString() : '');
      setHoaEscalation(initialInputs.hoaEscalation ? initialInputs.hoaEscalation.toString() : '');
      setOneTimeExtra(initialInputs.oneTimeExtra ? initialInputs.oneTimeExtra.toString() : '');
      setOneTimeExtraMonth(initialInputs.oneTimeExtraMonth ? initialInputs.oneTimeExtraMonth.toString() : '');
      setAnnualExtra(initialInputs.annualExtra ? initialInputs.annualExtra.toString() : '');
      setAnnualExtraMonth(initialInputs.annualExtraMonth ? initialInputs.annualExtraMonth.toString() : '');
      setBiweekly(initialInputs.biweekly || false);
    } else {
      const today = new Date();
      const y = today.getFullYear();
      const m = (today.getMonth() + 1).toString().padStart(2, '0');
      const d = today.getDate().toString().padStart(2, '0');
      setStartDate(`${y}-${m}-${d}`);
    }
  }, [initialInputs]);

  // Reactive updates for Down Payment values
  const handleHomePriceChange = (val: string) => {
    setHomePrice(val);
    const priceNum = parseFloat(val) || 0;
    
    if (downPaymentType === 'percentage') {
      const pctNum = parseFloat(downPaymentPercent) || 0;
      const cash = (pctNum / 100) * priceNum;
      setDownPaymentCash(cash > 0 ? Math.round(cash).toString() : '');
    } else {
      const cashNum = parseFloat(downPaymentCash) || 0;
      const pct = priceNum > 0 ? (cashNum / priceNum) * 100 : 0;
      setDownPaymentPercent(pct > 0 ? Number(pct.toFixed(2)).toString() : '');
    }
  };

  const handleDownPaymentCashChange = (val: string) => {
    setDownPaymentCash(val);
    setDownPaymentType('cash');
    const cashNum = parseFloat(val) || 0;
    const priceNum = parseFloat(homePrice) || 0;
    const pct = priceNum > 0 ? (cashNum / priceNum) * 100 : 0;
    setDownPaymentPercent(pct > 0 ? Number(pct.toFixed(2)).toString() : '');
  };

  const handleDownPaymentPercentChange = (val: string) => {
    setDownPaymentPercent(val);
    setDownPaymentType('percentage');
    const pctNum = parseFloat(val) || 0;
    const priceNum = parseFloat(homePrice) || 0;
    const cash = (pctNum / 100) * priceNum;
    setDownPaymentCash(cash > 0 ? Math.round(cash).toString() : '');
  };

  // Loan Amount Calculation
  const priceNum = parseFloat(homePrice) || 0;
  const cashNum = parseFloat(downPaymentCash) || 0;
  const loanAmount = Math.max(0, priceNum - cashNum);

  // Auto-calculate on initial mount if not run yet
  useEffect(() => {
    if (homePrice && interestRate) {
      triggerSubmit();
    }
  }, []);

  const triggerSubmit = () => {
    const formattedInputs: MortgageInputs = {
      homePrice: parseFloat(homePrice) || 0,
      downPaymentValue: downPaymentType === 'percentage' ? (parseFloat(downPaymentPercent) || 0) : (parseFloat(downPaymentCash) || 0),
      downPaymentType,
      interestRate: parseFloat(interestRate) || 0,
      loanTermYears: parseInt(loanTermYears, 10) || 30,
      startDate: startDate || new Date().toISOString().split('T')[0],
      propertyTax: parseFloat(propertyTax) || 0,
      homeInsurance: parseFloat(homeInsurance) || 0,
      pmiMonthly: parseFloat(pmiMonthly) || 0,
      hoaMonthly: parseFloat(hoaMonthly) || 0,
      extraMonthly: parseFloat(extraMonthly) || 0,
      taxEscalation: parseFloat(taxEscalation) || 0,
      insuranceEscalation: parseFloat(insuranceEscalation) || 0,
      hoaEscalation: parseFloat(hoaEscalation) || 0,
      oneTimeExtra: parseFloat(oneTimeExtra) || 0,
      oneTimeExtraMonth: parseInt(oneTimeExtraMonth, 10) || 0,
      annualExtra: parseFloat(annualExtra) || 0,
      annualExtraMonth: parseInt(annualExtraMonth, 10) || 1,
      biweekly,
    };
    onCalculate(formattedInputs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSubmit();
  };

  return (
    <form
      id="mortgage-calc-form"
      onSubmit={handleSubmit}
      className="bg-white border border-[#E5E7EB] rounded-2xl p-[18px] space-y-5 select-none shadow-sm"
    >
      {/* 1. LOAN DETAILS */}
      <div className="space-y-4">
        <h3 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider pb-2 border-b border-[#E5E7EB]">
          Loan Details
        </h3>

        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          {/* Home Price */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#374151]">
              Home Price
            </label>
            <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[38px] focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/8 transition-all duration-150 overflow-hidden px-2.5">
              <span className="text-[#9CA3AF] text-sm mr-1 select-none">$</span>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={homePrice}
                onChange={(e) => handleHomePriceChange(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[14px] text-[#111827] placeholder-[#9CA3AF] font-medium"
                placeholder="e.g. 400,000"
              />
            </div>
          </div>

          {/* Down Payment $ */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#374151]">
              Down Payment ($)
            </label>
            <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[38px] focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/8 transition-all duration-150 overflow-hidden px-2.5">
              <span className="text-[#9CA3AF] text-sm mr-1 select-none">$</span>
              <input
                type="number"
                min="0"
                step="any"
                value={downPaymentCash}
                onChange={(e) => handleDownPaymentCashChange(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[14px] text-[#111827] placeholder-[#9CA3AF] font-medium"
                placeholder="e.g. 80,000"
              />
            </div>
          </div>

          {/* Down Payment % */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#374151]">
              Down Payment (%)
            </label>
            <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[38px] focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/8 transition-all duration-150 overflow-hidden px-2.5">
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={downPaymentPercent}
                onChange={(e) => handleDownPaymentPercentChange(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[14px] text-[#111827] placeholder-[#9CA3AF] font-medium"
                placeholder="e.g. 20"
              />
              <span className="text-[#9CA3AF] text-sm ml-1 select-none">%</span>
            </div>
          </div>

          {/* Loan Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#374151]">
              Loan Amount
            </label>
            <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-neutral-50 h-[38px] px-2.5 select-none">
              <span className="text-[#9CA3AF] text-sm mr-1">$</span>
              <span className="text-[14px] font-semibold text-[#111827]">
                {loanAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#374151]">
              Interest Rate
            </label>
            <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[38px] focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/8 transition-all duration-150 overflow-hidden px-2.5">
              <input
                type="number"
                min="0"
                step="any"
                required
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[14px] text-[#111827] placeholder-[#9CA3AF] font-medium"
                placeholder="e.g. 6.5"
              />
              <span className="text-[#9CA3AF] text-sm ml-1 select-none">%</span>
            </div>
          </div>

          {/* Loan Term */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#374151]">
              Loan Term
            </label>
            <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[38px] focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/8 transition-all duration-150 overflow-hidden px-2.5">
              <input
                type="number"
                min="1"
                max="50"
                required
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[14px] text-[#111827] placeholder-[#9CA3AF] font-medium"
                placeholder="30"
              />
              <span className="text-[#9CA3AF] text-xs ml-1 select-none whitespace-nowrap">years</span>
            </div>
          </div>
        </div>

        {/* Loan Start Date (Full Width) */}
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[#374151]">
            Loan Start Date
          </label>
          <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[38px] focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/8 transition-all duration-150 overflow-hidden px-2.5">
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-full bg-transparent outline-none text-[13px] text-[#111827] font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. ADDITIONAL MONTHLY COSTS */}
      <div className="space-y-4">
        <h3 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider pb-2 border-b border-[#E5E7EB]">
          Additional Costs
        </h3>

        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          {/* Property Tax */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#374151]">
              Property Tax (Annual)
            </label>
            <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[38px] focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/8 transition-all duration-150 overflow-hidden px-2.5">
              <span className="text-[#9CA3AF] text-sm mr-1 select-none">$</span>
              <input
                type="number"
                min="0"
                step="any"
                value={propertyTax}
                onChange={(e) => setPropertyTax(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[14px] text-[#111827] placeholder-neutral-300 font-medium"
                placeholder="0"
              />
            </div>
          </div>

          {/* Home Insurance */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#374151]">
              Home Insurance (Annual)
            </label>
            <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[38px] focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/8 transition-all duration-150 overflow-hidden px-2.5">
              <span className="text-[#9CA3AF] text-sm mr-1 select-none">$</span>
              <input
                type="number"
                min="0"
                step="any"
                value={homeInsurance}
                onChange={(e) => setHomeInsurance(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[14px] text-[#111827] placeholder-neutral-300 font-medium"
                placeholder="0"
              />
            </div>
          </div>

          {/* PMI Monthly */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#374151]">
              PMI (Monthly)
            </label>
            <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[38px] focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/8 transition-all duration-150 overflow-hidden px-2.5">
              <span className="text-[#9CA3AF] text-sm mr-1 select-none">$</span>
              <input
                type="number"
                min="0"
                step="any"
                value={pmiMonthly}
                onChange={(e) => setPmiMonthly(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[14px] text-[#111827] placeholder-neutral-300 font-medium"
                placeholder="0"
              />
            </div>
          </div>

          {/* HOA Monthly */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#374151]">
              HOA Fees (Monthly)
            </label>
            <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[38px] focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/8 transition-all duration-150 overflow-hidden px-2.5">
              <span className="text-[#9CA3AF] text-sm mr-1 select-none">$</span>
              <input
                type="number"
                min="0"
                step="any"
                value={hoaMonthly}
                onChange={(e) => setHoaMonthly(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[14px] text-[#111827] placeholder-neutral-300 font-medium"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Extra Monthly Payment (Full Width) */}
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[#374151]">
            Extra Monthly Payment
          </label>
          <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[38px] focus-within:border-[#111827] focus-within:ring-2 focus-within:ring-[#111827]/8 transition-all duration-150 overflow-hidden px-2.5">
            <span className="text-[#9CA3AF] text-sm mr-1 select-none">$</span>
            <input
              type="number"
              min="0"
              step="any"
              value={extraMonthly}
              onChange={(e) => setExtraMonthly(e.target.value)}
              className="w-full h-full bg-transparent outline-none text-[14px] text-[#111827] placeholder-neutral-300 font-medium"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* 3. ADVANCED OPTIONS (Radix Collapsible) */}
      <Collapsible.Root open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="w-full border-t border-[#E5E7EB] pt-3">
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="flex items-center justify-between w-full text-[12px] font-semibold text-[#111827] uppercase tracking-wider py-1.5 cursor-pointer outline-none transition-colors"
          >
            <span>* Advanced Options</span>
            {isAdvancedOpen ? (
              <ChevronUp className="h-4 w-4 text-[#6B7280]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#6B7280]" />
            )}
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="space-y-4 pt-3 overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
          <div className="grid grid-cols-3 gap-x-2.5 gap-y-3">
            {/* Tax Escalation */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-[#6B7280] leading-tight">
                Tax Escal.
              </label>
              <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[34px] px-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={taxEscalation}
                  onChange={(e) => setTaxEscalation(e.target.value)}
                  className="w-full h-full bg-transparent outline-none text-[12px] text-[#111827] font-medium"
                  placeholder="0"
                />
                <span className="text-[#9CA3AF] text-xs ml-0.5">%</span>
              </div>
            </div>

            {/* Insurance Escalation */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-[#6B7280] leading-tight">
                Ins. Escal.
              </label>
              <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[34px] px-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={insuranceEscalation}
                  onChange={(e) => setInsuranceEscalation(e.target.value)}
                  className="w-full h-full bg-transparent outline-none text-[12px] text-[#111827] font-medium"
                  placeholder="0"
                />
                <span className="text-[#9CA3AF] text-xs ml-0.5">%</span>
              </div>
            </div>

            {/* HOA Escalation */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-[#6B7280] leading-tight">
                HOA Escal.
              </label>
              <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[34px] px-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={hoaEscalation}
                  onChange={(e) => setHoaEscalation(e.target.value)}
                  className="w-full h-full bg-transparent outline-none text-[12px] text-[#111827] font-medium"
                  placeholder="0"
                />
                <span className="text-[#9CA3AF] text-xs ml-0.5">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            {/* One-time Extra */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#374151]">
                One-time Extra ($)
              </label>
              <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[36px] px-2">
                <span className="text-[#9CA3AF] text-xs mr-0.5">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={oneTimeExtra}
                  onChange={(e) => setOneTimeExtra(e.target.value)}
                  className="w-full h-full bg-transparent outline-none text-[13px] text-[#111827] font-medium"
                  placeholder="0"
                />
              </div>
            </div>

            {/* One-time Extra Month */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#374151]">
                On Month # (1-360)
              </label>
              <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[36px] px-2">
                <input
                  type="number"
                  min="1"
                  max="360"
                  value={oneTimeExtraMonth}
                  onChange={(e) => setOneTimeExtraMonth(e.target.value)}
                  className="w-full h-full bg-transparent outline-none text-[13px] text-[#111827] font-medium"
                  placeholder="e.g. 12"
                />
              </div>
            </div>

            {/* Annual Extra */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#374151]">
                Annual Extra ($)
              </label>
              <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[36px] px-2">
                <span className="text-[#9CA3AF] text-xs mr-0.5">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={annualExtra}
                  onChange={(e) => setAnnualExtra(e.target.value)}
                  className="w-full h-full bg-transparent outline-none text-[13px] text-[#111827] font-medium"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Annual Extra Month */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#374151]">
                Every Month # (1-12)
              </label>
              <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-white h-[36px] px-2">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={annualExtraMonth}
                  onChange={(e) => setAnnualExtraMonth(e.target.value)}
                  className="w-full h-full bg-transparent outline-none text-[13px] text-[#111827] font-medium"
                  placeholder="12"
                />
              </div>
            </div>
          </div>

          {/* Biweekly Cycle Switch */}
          <div className="flex items-center justify-between border border-[#E5E7EB] rounded-xl bg-neutral-50 p-2.5">
            <div className="space-y-0.5">
              <span className="block text-[11px] font-bold text-[#374151] uppercase tracking-wider">
                Biweekly Cycle
              </span>
              <span className="block text-[10px] text-[#6B7280]">
                Pay 26 half-payments a year
              </span>
            </div>
            <Switch.Root
              checked={biweekly}
              onCheckedChange={setBiweekly}
              className={`w-10 h-5.5 rounded-full relative border border-[#E5E7EB] cursor-pointer outline-none transition-colors duration-150 ${
                biweekly ? 'bg-[#111827]' : 'bg-[#E5E7EB]'
              }`}
            >
              <Switch.Thumb
                className={`block w-4.5 h-4.5 rounded-full bg-white transition-transform duration-150 transform ${
                  biweekly ? 'translate-x-[18px]' : 'translate-x-[2px]'
                }`}
              />
            </Switch.Root>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* CALCULATE BUTTON */}
      <button
        type="submit"
        className="w-full h-[42px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#111827] text-white rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 shadow-sm"
      >
        <Calculator className="h-4.5 w-4.5" />
        Calculate
      </button>
    </form>
  );
}
