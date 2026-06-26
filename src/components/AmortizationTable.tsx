import React, { useState } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { AmortizationPeriod } from '../types';

interface AmortizationTableProps {
  schedule: AmortizationPeriod[];
  isBiweekly: boolean;
}

export default function AmortizationTable({ schedule, isBiweekly }: AmortizationTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Formatting helpers
  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  // Filter schedule based on search query
  const filteredSchedule = schedule.filter((period) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Search within payment number
    if (period.paymentNumber.toString().includes(query)) return true;

    // Search within year (e.g. Yr 1, Year 1)
    const periodsPerYear = isBiweekly ? 26 : 12;
    const yr = Math.ceil(period.paymentNumber / periodsPerYear);
    if (`yr ${yr}`.includes(query) || `year ${yr}`.includes(query)) return true;

    // Search within Date string
    const dStr = formatDate(period.date).toLowerCase();
    if (dStr.includes(query)) return true;

    return false;
  });

  // Pagination parameters
  const totalItems = filteredSchedule.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSchedule = filteredSchedule.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Clean CSV exporter
  const handleCSVExport = () => {
    const headers = [
      'Payment #',
      'Date',
      'Regular P&I',
      'Principal Portion',
      'Interest Portion',
      'Extra Principal',
      'Property Tax',
      'Home Insurance',
      'PMI',
      'HOA Fees',
      'Total Payment',
      'Remaining Balance',
      'Cumulative Interest',
      'Cumulative Principal',
    ];

    const rows = schedule.map((period) => [
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
      period.cumulativePrincipal.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mortgage_amortization_schedule.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-5 border border-[#E5E7EB] rounded-2xl space-y-5 select-none font-sans shadow-sm">
      {/* TOOLBAR CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider">
            Amortization Schedule
          </h3>
          <p className="text-[11px] text-[#6B7280]">
            Search by date, year index, or payment period.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-52">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#9CA3AF]">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search (e.g. Jan, Yr 1)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-9 pr-3 h-[38px] bg-white border border-[#E5E7EB] rounded-xl text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/8 transition-all"
            />
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#6B7280] font-medium uppercase tracking-wider">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 h-[38px] bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#374151] focus:outline-none focus:border-[#111827] cursor-pointer"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          {/* CSV Export Button */}
          <button
            type="button"
            onClick={handleCSVExport}
            className="inline-flex items-center gap-1.5 h-[38px] px-4 bg-[#111827] hover:bg-[#1F2937] text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* HORIZONTAL SCROLLABLE SCHEDULE TABLE */}
      <div className="border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] uppercase tracking-wider text-[10px] font-semibold select-none">
                <th className="py-3 px-3.5 font-semibold">Pmt #</th>
                <th className="py-3 px-3.5 font-semibold">Date</th>
                <th className="py-3 px-3.5 text-right font-semibold">Regular P&I</th>
                <th className="py-3 px-3.5 text-right font-semibold">Principal</th>
                <th className="py-3 px-3.5 text-right font-semibold">Interest</th>
                <th className="py-3 px-3.5 text-right font-semibold">Extra</th>
                <th className="py-3 px-3.5 text-right font-semibold">Tax</th>
                <th className="py-3 px-3.5 text-right font-semibold">Insur.</th>
                <th className="py-3 px-3.5 text-right font-semibold">PMI</th>
                <th className="py-3 px-3.5 text-right font-semibold">HOA</th>
                <th className="py-3 px-3.5 text-right font-semibold bg-[#F3F4F6]">Total Payment</th>
                <th className="py-3 px-3.5 text-right font-semibold">Remaining Bal</th>
                <th className="py-3 px-3.5 text-right font-semibold">Cum. Int</th>
                <th className="py-3 px-3.5 text-right font-semibold">Cum. Princ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {paginatedSchedule.length > 0 ? (
                paginatedSchedule.map((period) => (
                  <tr key={period.paymentNumber} className="hover:bg-[#F9FAFB]/50 transition-colors text-[#374151] text-[12px]">
                    <td className="py-2.5 px-3.5 font-mono font-medium text-[#9CA3AF]">
                      {period.paymentNumber}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-[#111827] whitespace-nowrap">
                      {formatDate(period.date)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#4B5563]">
                      {formatCurrency(period.regularPayment)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#111827] font-semibold">
                      {formatCurrency(period.principal)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#4B5563]">
                      {formatCurrency(period.interest)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#111827] font-semibold">
                      {period.extraPayment > 0 ? formatCurrency(period.extraPayment) : '—'}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#4B5563]">
                      {period.tax > 0 ? formatCurrency(period.tax) : '—'}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#4B5563]">
                      {period.insurance > 0 ? formatCurrency(period.insurance) : '—'}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#4B5563]">
                      {period.pmi > 0 ? formatCurrency(period.pmi) : '—'}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#4B5563]">
                      {period.hoa > 0 ? formatCurrency(period.hoa) : '—'}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono font-semibold bg-[#F9FAFB] text-[#111827]">
                      {formatCurrency(period.totalPayment)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-[#111827]">
                      {formatCurrency(period.remainingBalance)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#4B5563]">
                      {formatCurrency(period.cumulativeInterest)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#4B5563]">
                      {formatCurrency(period.cumulativePrincipal)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-[#9CA3AF] font-semibold uppercase tracking-wider text-xs">
                    No matching payments found in schedule.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION STATUS & CONTROLS */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#4B5563] font-medium">
          <div className="uppercase text-[10px] tracking-wider text-[#6B7280]">
            Showing <span className="font-semibold text-[#111827]">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-[#111827]">
              {Math.min(startIndex + pageSize, totalItems)}
            </span>{' '}
            of <span className="font-semibold text-[#111827]">{totalItems}</span> payments
          </div>

          <div className="flex items-center gap-1.5">
            {/* First page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            {/* Prev page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Pages status */}
            <span className="px-3 py-1 bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] rounded-xl text-[11px] font-semibold uppercase tracking-wider">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Last page */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
