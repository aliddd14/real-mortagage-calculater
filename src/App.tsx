import React, { useState, useEffect } from 'react';
import MortgageForm from './components/MortgageForm';
import MortgageResults from './components/MortgageResults';
import AmortizationTable from './components/AmortizationTable';
import FaqSection from './components/FaqSection';
import EducationalSection from './components/EducationalSection';
import SEOSection from './components/SEOSection';
import AdSpace from './components/AdSpace';
import { MortgageInputs, CalculationResult } from './types';
import { calculateMortgage } from './utils/calculator';
import { exportToPDF } from './utils/pdfExport';
import { Share2, FileDown, Home, Info, Calculator, Check } from 'lucide-react';

const MortgageCharts = React.lazy(() => import('./components/MortgageCharts'));

export default function App() {
  const [inputs, setInputs] = useState<MortgageInputs | undefined>(undefined);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [initialFormValues, setInitialFormValues] = useState<MortgageInputs | undefined>(undefined);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [urlParamsNotice, setUrlParamsNotice] = useState(false);

  // Parse URL search parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const price = params.get('price');
    const down = params.get('down');
    const rate = params.get('rate');
    const term = params.get('term');

    if (price || down || rate || term) {
      const today = new Date();
      const y = today.getFullYear();
      const m = (today.getMonth() + 1).toString().padStart(2, '0');
      const d = today.getDate().toString().padStart(2, '0');

      const parsedInputs: MortgageInputs = {
        homePrice: parseFloat(price || '0') || 0,
        downPaymentValue: parseFloat(down || '0') || 0,
        downPaymentType: 'cash',
        interestRate: parseFloat(rate || '0') || 0,
        loanTermYears: parseInt(term || '30', 10) || 30,
        startDate: `${y}-${m}-${d}`,
        propertyTax: 0,
        homeInsurance: 0,
        pmiMonthly: 0,
        hoaMonthly: 0,
        extraMonthly: 0,
        taxEscalation: 0,
        insuranceEscalation: 0,
        hoaEscalation: 0,
        oneTimeExtra: 0,
        oneTimeExtraMonth: 0,
        annualExtra: 0,
        annualExtraMonth: 1,
        biweekly: false,
      };

      setInitialFormValues(parsedInputs);
      setUrlParamsNotice(true);
    }
  }, []);

  // Handle calculation action trigger
  const handleCalculate = (formInputs: MortgageInputs) => {
    setInputs(formInputs);
    const calculation = calculateMortgage(formInputs);
    setResult(calculation);
    setUrlParamsNotice(false);
  };

  // Synchronize inputs to URL query parameters on share action
  const handleShare = () => {
    if (!inputs) return;

    const url = new URL(window.location.href);
    url.searchParams.set('price', inputs.homePrice.toString());
    
    let downCash = inputs.downPaymentValue;
    if (inputs.downPaymentType === 'percentage') {
      downCash = (inputs.downPaymentValue / 100) * inputs.homePrice;
    }
    url.searchParams.set('down', Math.round(downCash).toString());
    url.searchParams.set('rate', inputs.interestRate.toString());
    url.searchParams.set('term', inputs.loanTermYears.toString());

    window.history.replaceState({}, '', url.toString());

    const shareText = `Explore this optimized mortgage schedule: Home Price $${inputs.homePrice.toLocaleString()}, Interest Rate ${inputs.interestRate}%, Payoff Term ${result?.payoffTermYears.toFixed(1)} Years! Check it out here:`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mortgage Amortization Calculation',
        text: shareText,
        url: url.toString(),
      }).catch(() => {
        navigator.clipboard.writeText(url.toString());
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      });
    } else {
      navigator.clipboard.writeText(url.toString());
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    }
  };

  const handlePDFExport = async () => {
    if (!result || !inputs) return;
    try {
      setIsExportingPDF(true);
      await exportToPDF(result, inputs);
    } catch (err) {
      console.error('Error generating PDF report:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased select-none text-[#111827]">
      {/* Dynamic SEO Injector */}
      <SEOSection />

      {/* CENTERED LAYOUT CONTAINER */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-5 lg:px-8 py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto w-full space-y-12">
          
          {/* HEADER HEADER -> CALCULATOR GAP is 48px */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
            <div className="space-y-1.5">
              <h1 className="text-[28px] font-semibold text-[#111827] tracking-tight leading-tight">
                Mortgage Calculator
              </h1>
              <p className="text-[13px] text-[#6B7280] font-normal">
                Calculate payments, view amortization schedules, and export reports.
              </p>
            </div>
            {result && inputs && (
              <div className="flex items-center gap-2">
                {/* Share Link */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center justify-center gap-1.5 h-[38px] px-4 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-xs font-semibold text-[#111827] rounded-xl uppercase tracking-wider cursor-pointer transition-colors duration-150"
                  >
                    <Share2 className="h-4 w-4 text-[#111827]" />
                    Share Plan
                  </button>
                  {shareSuccess && (
                    <div className="absolute right-0 top-full mt-1.5 bg-[#111827] text-white text-[10px] font-medium py-1 px-2.5 rounded-lg whitespace-nowrap z-50 uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Check className="h-3 w-3" /> Copied to clipboard!
                    </div>
                  )}
                </div>

                {/* PDF export */}
                <button
                  type="button"
                  onClick={handlePDFExport}
                  disabled={isExportingPDF}
                  className="inline-flex items-center justify-center gap-1.5 h-[38px] px-4 bg-[#111827] hover:bg-[#1F2937] disabled:bg-neutral-300 text-xs font-semibold text-white rounded-xl uppercase tracking-wider cursor-pointer transition-colors duration-150 border border-transparent"
                >
                  <FileDown className="h-4 w-4" />
                  {isExportingPDF ? 'Generating...' : 'Export PDF'}
                </button>
              </div>
            )}
          </header>

          {/* URL PARAM NOTICE */}
          {urlParamsNotice && (
            <div className="bg-[#F9FAFB] text-[#111827] rounded-2xl p-4 flex items-start gap-3 border border-[#E5E7EB]">
              <Info className="h-5 w-5 shrink-0 text-[#111827] mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-semibold block text-[#111827]">Shared Plan Loaded</span>
                <p className="text-[#4B5563] leading-normal font-medium">
                  Loan details from your shared link have been loaded into the form. Click the <strong>Calculate</strong> button to view schedules and charts!
                </p>
              </div>
            </div>
          )}

          {/* TOP THREE-COLUMN LAYOUT */}
          {/* Proportions: Left: 320px, Center: 1fr, Right: 300px (Ad Space). Gap: 24px */}
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_300px] gap-6 items-start pt-2">
            
            {/* COLUMN 1: LEFT FORM */}
            <div className="w-full">
              <MortgageForm onCalculate={handleCalculate} initialInputs={initialFormValues} />
            </div>

            {/* COLUMN 2: CENTER RESULTS & VISUALIZERS */}
            <div className="w-full space-y-6">
              {result && inputs ? (
                <>
                  {/* Results card display */}
                  <MortgageResults result={result} isBiweekly={inputs.biweekly} />

                  {/* Charts with clean Suspense */}
                  <React.Suspense
                    fallback={
                      <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] flex flex-col items-center justify-center h-64 select-none">
                        <div className="w-6 h-6 rounded-full border-2 border-[#111827] border-t-transparent animate-spin" />
                        <span className="text-xs text-[#6B7280] mt-3 font-medium uppercase tracking-wider">
                          Loading interactive charts...
                        </span>
                      </div>
                    }
                  >
                    <MortgageCharts result={result} isBiweekly={inputs.biweekly} />
                  </React.Suspense>

                  {/* Paginated Schedule table with CSV download */}
                  <AmortizationTable schedule={result.schedule} isBiweekly={inputs.biweekly} />
                </>
              ) : (
                /* EMPTY STATE CARD (Before calculation runs) */
                <div className="bg-white p-8 border border-[#E5E7EB] rounded-2xl text-center h-[260px] flex flex-col items-center justify-center select-none">
                  <div className="w-12 h-12 rounded-full bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center mb-4">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#111827] tracking-tight">
                    Enter loan details and click Calculate
                  </h3>
                  <p className="text-[13px] text-[#6B7280] mt-1.5 max-w-sm">
                    Your mortgage payment amortization schedules, charts, and financial analytics will appear here.
                  </p>
                </div>
              )}
            </div>

            {/* COLUMN 3: RIGHT SIDE AD SPACE */}
            <div className="w-full lg:col-span-2 xl:col-span-1">
              <AdSpace />
            </div>
          </div>

          {/* CALCULATOR -> FAQ GAP is 64px */}
          <div className="pt-16 border-t border-[#E5E7EB]">
            <FaqSection />
          </div>

          {/* FAQ -> CONTENT GAP is 72px */}
          <div className="pt-18 border-t border-[#E5E7EB]">
            <EducationalSection />
          </div>

          {/* DISCLAIMER FOOTER */}
          <footer className="pt-12 border-t border-[#E5E7EB] text-center text-[11px] text-[#6B7280] leading-relaxed space-y-4">
            <div className="max-w-[900px] mx-auto text-[#4B5563]">
              <p className="font-semibold text-[#111827]">
                Financial Disclaimer: This Mortgage Calculator is intended solely for educational, illustrative, and personal planning purposes. All calculations are mathematical estimations based on the information provided and do not constitute a formal pre-approval, legal offer, or absolute underwriting assessment.
              </p>
              <p className="mt-2 text-[#6B7280]">
                Actual mortgage products, interest rates, compounding frequencies, escrow tax evaluations, PMI criteria, HOA fees, and insurance premiums depend on unique borrower credit histories, financial reserves, geographical tax districts, and shifting underwriting practices. Please consult with a licensed mortgage broker, certified financial planner, or financial advisor before executing real estate or financial contracts.
              </p>
            </div>
            <p className="text-[10px] font-medium tracking-widest uppercase pt-4 text-[#9CA3AF]">
              Mortgage Calculator &copy; 2026 • Optimized for Performance and Clarity
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
