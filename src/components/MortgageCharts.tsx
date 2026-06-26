import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { CalculationResult } from '../types';
import { formatCurrency } from '../utils/calculator';
import * as Tabs from '@radix-ui/react-tabs';
import { PieChart as PieIcon, TrendingDown as LineIcon, BarChart2 as BarIcon } from 'lucide-react';

interface MortgageChartsProps {
  result: CalculationResult;
  isBiweekly: boolean;
}

// Custom Tooltip component for a cohesive aesthetic
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] text-white p-3 rounded-xl border border-[#374151] text-xs space-y-1 font-mono select-none shadow-lg">
        {label && (
          <p className="font-semibold text-neutral-300 border-b border-[#374151] pb-1 mb-1 uppercase tracking-wider text-[10px]">
            {label}
          </p>
        )}
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center gap-6">
            <span className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: item.color }}
              />
              {item.name}:
            </span>
            <span className="font-semibold text-white text-[11px]">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MortgageCharts({ result, isBiweekly }: MortgageChartsProps) {
  const {
    totalInterest,
    totalPrincipal,
    totalTax,
    totalInsurance,
    totalPMI,
    totalHOA,
    totalExtraPaid,
    schedule,
  } = result;

  // 1. Pie Chart Data: Total Lifetime Costs Breakdown in clean, trustworthy grayscale/blues
  const pieData = [
    { name: 'Original Principal', value: totalPrincipal - totalExtraPaid, color: '#111827' },
    { name: 'Extra Principal Paid', value: totalExtraPaid, color: '#374151' },
    { name: 'Total Interest Paid', value: totalInterest, color: '#6B7280' },
    { name: 'Property Tax', value: totalTax, color: '#9CA3AF' },
    { name: 'Home Insurance', value: totalInsurance, color: '#D1D5DB' },
    { name: 'PMI Paid', value: totalPMI, color: '#E5E7EB' },
    { name: 'HOA Paid', value: totalHOA, color: '#F3F4F6' },
  ].filter((item) => item.value > 0);

  // 2. Line Chart Data: Remaining Balance & Cumulative Interest Over Time (Year-End Snapshots)
  const periodsPerYear = isBiweekly ? 26 : 12;
  const lineData: any[] = [];
  
  // Year 0
  lineData.push({
    yearLabel: 'Start',
    'Remaining Balance': totalPrincipal,
    'Cumulative Interest': 0,
  });

  for (let i = 0; i < schedule.length; i++) {
    const payment = schedule[i];
    const isYearEnd = (payment.paymentNumber % periodsPerYear === 0) || (i === schedule.length - 1);
    if (isYearEnd) {
      const yearNum = Math.ceil(payment.paymentNumber / periodsPerYear);
      lineData.push({
        yearLabel: `Yr ${yearNum}`,
        'Remaining Balance': Math.round(payment.remainingBalance),
        'Cumulative Interest': Math.round(payment.cumulativeInterest),
      });
    }
  }

  // 3. Bar Chart Data: Annual Interest Paid vs Principal Paid (Regular + Extras)
  const barData: any[] = [];
  let currentYearPrincipal = 0;
  let currentYearInterest = 0;
  let currentYearExtra = 0;

  for (let i = 0; i < schedule.length; i++) {
    const payment = schedule[i];
    currentYearPrincipal += payment.principal;
    currentYearInterest += payment.interest;
    currentYearExtra += payment.extraPayment;

    const isYearEnd = (payment.paymentNumber % periodsPerYear === 0) || (i === schedule.length - 1);
    if (isYearEnd) {
      const yearNum = Math.ceil(payment.paymentNumber / periodsPerYear);
      barData.push({
        yearLabel: `Yr ${yearNum}`,
        Principal: Math.round(currentYearPrincipal + currentYearExtra),
        Interest: Math.round(currentYearInterest),
      });
      // Reset for next year
      currentYearPrincipal = 0;
      currentYearInterest = 0;
      currentYearExtra = 0;
    }
  }

  return (
    <div className="bg-white p-6 border border-[#E5E7EB] rounded-2xl space-y-6 select-none shadow-sm">
      <Tabs.Root defaultValue="breakdown" className="space-y-4">
        {/* TABS SELECTOR LIST */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-3">
          <h3 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider">
            Interactive Visualizers
          </h3>
          <Tabs.List className="inline-flex bg-[#F3F4F6] p-0.5 rounded-xl border border-[#E5E7EB] self-start">
            <Tabs.Trigger
              value="breakdown"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg text-[#6B7280] data-[state=active]:bg-white data-[state=active]:text-[#111827] data-[state=active]:shadow-sm transition-all uppercase tracking-wider cursor-pointer outline-none"
            >
              <PieIcon className="h-3.5 w-3.5" />
              Breakdown Donut
            </Tabs.Trigger>
            <Tabs.Trigger
              value="balance"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg text-[#6B7280] data-[state=active]:bg-white data-[state=active]:text-[#111827] data-[state=active]:shadow-sm transition-all uppercase tracking-wider cursor-pointer outline-none"
            >
              <LineIcon className="h-3.5 w-3.5" />
              Balance Over Time
            </Tabs.Trigger>
            <Tabs.Trigger
              value="annual"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg text-[#6B7280] data-[state=active]:bg-white data-[state=active]:text-[#111827] data-[state=active]:shadow-sm transition-all uppercase tracking-wider cursor-pointer outline-none"
            >
              <BarIcon className="h-3.5 w-3.5" />
              Annual Cost Growth
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        {/* TAB CONTENT 1: PIE / DONUT BREAKDOWN */}
        <Tabs.Content value="breakdown" className="outline-none space-y-4 focus:ring-0">
          <p className="text-xs text-[#6B7280] font-normal leading-relaxed">
            A comprehensive visual distribution of all payments made over the actual lifespan of your mortgage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Chart */}
            <div className="md:col-span-7 h-60 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Sum Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Grand Total
                </span>
                <span className="text-base font-bold text-[#111827] mt-0.5">
                  {formatCurrency(result.totalPaid)}
                </span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="md:col-span-5 space-y-2 border-t md:border-t-0 md:border-l border-[#E5E7EB] pt-4 md:pt-0 md:pl-6 max-h-[220px] overflow-y-auto">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Payment Categories
              </h4>
              <div className="space-y-1.5 text-[11px]">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[#4B5563]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate max-w-[120px] font-medium">{item.name}</span>
                    </div>
                    <span className="font-semibold text-[#111827]">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Tabs.Content>

        {/* TAB CONTENT 2: BALANCES OVER TIME */}
        <Tabs.Content value="balance" className="outline-none space-y-4 focus:ring-0">
          <p className="text-xs text-[#6B7280] font-normal leading-relaxed">
            Track your remaining principal loan balance decline contrasted with cumulative interest buildup across payoff years.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="yearLabel" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={9} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 10, fontWeight: 'medium', textTransform: 'uppercase', paddingTop: 10 }} />
                <Line
                  type="monotone"
                  dataKey="Remaining Balance"
                  stroke="#111827"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Cumulative Interest"
                  stroke="#9CA3AF"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Tabs.Content>

        {/* TAB CONTENT 3: ANNUAL COST GROWTH */}
        <Tabs.Content value="annual" className="outline-none space-y-4 focus:ring-0">
          <p className="text-xs text-[#6B7280] font-normal leading-relaxed">
            Examine how your annual payments transition over time. Extra principal prepayments significantly shorten standard payback term curves.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="yearLabel" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={9} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="square" iconSize={6} wrapperStyle={{ fontSize: 10, fontWeight: 'medium', textTransform: 'uppercase', paddingTop: 10 }} />
                <Bar dataKey="Principal" stackId="a" fill="#111827" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Interest" stackId="a" fill="#9CA3AF" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
