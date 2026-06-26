import React from 'react';

export default function EducationalSection() {
  return (
    <div className="w-full max-w-[900px] mx-auto space-y-12 select-none text-[#111827] font-sans pb-12">
      {/* SECTION HEADER */}
      <div className="space-y-4">
        <h2 className="text-[22px] font-semibold text-[#111827] tracking-tight">
          Understanding Mortgages
        </h2>
        <p className="text-[14px] leading-[1.75] text-[#4B5563]">
          A mortgage is likely the largest financial commitment most people will ever make.
          Understanding how mortgages work, what factors influence your costs, and strategies for
          managing your loan effectively can save you tens of thousands of dollars over the lifetime
          of the loan. This guide covers the essential concepts every homebuyer and current homeowner
          should know to make informed decisions about their mortgage.
        </p>
      </div>

      {/* TOPIC 1 */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-semibold text-[#111827] tracking-tight">
          Mortgage Basics
        </h3>
        <p className="text-[14px] leading-[1.75] text-[#4B5563]">
          When you purchase a home with a mortgage, you are essentially borrowing money from a financial
          institution to cover the difference between your down payment and the purchase price. The lender
          charges you interest for the privilege of borrowing, and the total amount you repay includes
          both the principal (the original loan amount) and the accumulated interest. The most common
          mortgage type in the United States is the 30-year fixed-rate mortgage, which offers predictable
          monthly payments over three decades. However, 15-year fixed-rate mortgages, adjustable-rate
          mortgages (ARMs), FHA loans, VA loans, and jumbo loans each serve different financial situations
          and goals. Understanding the trade-offs between loan types, terms, and interest rates is
          fundamental to choosing the right mortgage for your circumstances.
        </p>
        <p className="text-[14px] leading-[1.75] text-[#4B5563]">
          Your down payment plays a critical role in determining your loan terms. A larger down payment
          reduces the amount you need to borrow, lowers your monthly payment, and helps you avoid PMI. While
          20% down has traditionally been considered the standard, many loan programs allow down payments
          as low as 3% to 5%, and some government-backed programs like VA loans require no down payment at
          all. However, putting less than 20% down means you will pay PMI and borrow more, increasing your
          total cost over time. It is important to balance the desire for a lower down payment with the
          long-term financial implications of a larger loan.
        </p>
      </div>

      {/* TOPIC 2 */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-semibold text-[#111827] tracking-tight">
          Monthly Payment Breakdown
        </h3>
        <p className="text-[14px] leading-[1.75] text-[#4B5563]">
          Your total monthly mortgage payment typically consists of several components, often referred to
          as PITI (Principal, Interest, Taxes, and Insurance). The principal portion goes toward reducing
          your loan balance, while the interest is the cost of borrowing money. Property taxes are levied
          by local governments and can vary significantly by location, typically ranging from 0.5% to 2%
          of the home's assessed value annually. Homeowners insurance protects your property against damage
          from fire, theft, weather events, and other covered perils. If your down payment is less than 20%,
          you will also pay PMI, and if you live in a community with a homeowners association, HOA fees
          will be added to your monthly costs.
        </p>
        <p className="text-[14px] leading-[1.75] text-[#4B5563]">
          Many lenders require an escrow account that bundles your tax and insurance payments into your
          monthly mortgage payment. The lender holds these funds in escrow and pays your property taxes and
          insurance premiums when they come due. This ensures these important bills are paid on time but also
          means your monthly payment could adjust annually if your tax assessment or insurance premiums change.
          Understanding each component of your payment helps you budget accurately and identify opportunities
          to reduce costs, such as appealing your property tax assessment or shopping for better insurance rates.
        </p>
      </div>

      {/* TOPIC 3 */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-semibold text-[#111827] tracking-tight">
          How Interest Calculation Works
        </h3>
        <p className="text-[14px] leading-[1.75] text-[#4B5563]">
          Mortgage interest is calculated using a process called amortization, which spreads your payments over
          the life of the loan in a way that ensures each payment covers the interest due plus some principal
          reduction. In the early years of a mortgage, the majority of each payment goes toward interest because
          the outstanding balance is at its highest. As you make payments and reduce the balance, the interest
          portion decreases and the principal portion increases. This means that in the first year of a 30-year
          mortgage, you might be paying 70-80% interest and only 20-30% principal, while in the final years,
          the ratio is reversed. Understanding how amortization works is essential for evaluating payoff strategies,
          as even small extra payments can have a powerful compounding effect when applied directly to the
          principal balance.
        </p>
      </div>
    </div>
  );
}
