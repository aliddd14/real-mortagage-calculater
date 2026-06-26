import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

const faqItems = [
  {
    id: 'faq-1',
    question: 'What is a mortgage?',
    answer: 'A mortgage is a specialized type of loan used to purchase or maintain real estate. The property itself serves as collateral to secure the loan. The borrower repays the lender over a structured term (commonly 15 or 30 years) with periodic payments covering principal, interest, taxes, and homeowners insurance.'
  },
  {
    id: 'faq-2',
    question: 'How is mortgage interest calculated?',
    answer: 'Mortgage interest is typically calculated using amortization formulas based on your outstanding principal balance at the beginning of each period. As you make payments and reduce the principal, the interest portion of subsequent payments decreases and the principal paydown portion increases, creating a compounding amortization effect.'
  },
  {
    id: 'faq-3',
    question: 'What affects monthly mortgage payments?',
    answer: 'Your monthly mortgage payment is primarily determined by four factors: the loan amount, the interest rate, the loan term, and escrow fees. Escrow fees include annual property taxes, homeowners insurance premiums, private mortgage insurance (PMI) if applicable, and homeowners association (HOA) dues.'
  },
  {
    id: 'faq-4',
    question: 'What is PMI (Private Mortgage Insurance)?',
    answer: 'PMI is an extra insurance premium required by lenders when your down payment is less than 20% of the home\'s purchase price. This insurance protects the lender (not the borrower) in the event of default. PMI is typically canceled automatically once your loan-to-value (LTV) ratio drops to 78% or below, or upon request at 80%.'
  },
  {
    id: 'faq-5',
    question: 'How can I pay off my mortgage faster?',
    answer: 'You can shorten your payoff term and save significantly on interest by making extra principal payments. This includes adding a set amount to your monthly payment, making a one-time extra payment, or switching to a biweekly payment cycle (which effectively adds one extra full monthly payment every year).'
  },
  {
    id: 'faq-6',
    question: 'What is the difference between fixed and adjustable-rate mortgages?',
    answer: 'A fixed-rate mortgage maintains the exact same interest rate and base payment for the entire life of the loan, offering long-term stability. An adjustable-rate mortgage (ARM) starts with a fixed introductory period, after which the interest rate adjusts periodically based on current market indices, which can cause payments to fluctuate.'
  }
];

export default function FaqSection() {
  return (
    <div className="w-full max-w-[900px] mx-auto space-y-6 select-none font-sans">
      <h2 className="text-[22px] font-semibold text-[#111827] text-center tracking-tight">
        Frequently Asked Questions
      </h2>

      <Accordion.Root type="single" collapsible className="space-y-2.5">
        {faqItems.map((item) => (
          <Accordion.Item
            key={item.id}
            value={item.id}
            className="border border-[#E5E7EB] rounded-[4px] overflow-hidden bg-white hover:border-neutral-300 transition-all duration-200"
          >
            <Accordion.Trigger className="flex justify-between items-center w-full px-5 h-[48px] bg-white text-left text-[14px] font-medium text-[#111827] transition-colors cursor-pointer group outline-none">
              <span>{item.question}</span>
              <ChevronDown className="h-4 w-4 text-[#6B7280] group-data-[state=open]:rotate-180 transition-transform duration-200 shrink-0" />
            </Accordion.Trigger>

            <Accordion.Content className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden transition-all bg-white text-[14px] text-[#4B5563] leading-[1.75]">
              <div className="px-5 pb-5 pt-1 border-t border-[#E5E7EB]/50">
                {item.answer}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
