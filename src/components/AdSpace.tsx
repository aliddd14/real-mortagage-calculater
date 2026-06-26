import React from 'react';

interface AdSpaceProps {
  className?: string;
}

export default function AdSpace({ className = '' }: AdSpaceProps) {
  return (
    <div 
      className={`flex flex-col gap-6 w-full max-w-[300px] mx-auto md:max-w-none md:flex-row md:justify-center xl:flex-col xl:max-w-[300px] xl:mx-0 ${className}`}
      id="ad-sidebar-container"
    >
      {/* Upper 300x250 Medium Rectangle Ad Slot */}
      <div 
        id="ad-slot-300x250"
        className="w-[300px] h-[250px] bg-[#F9FAFB] border border-dashed border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center p-4 transition-colors select-none shrink-0"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
          Advertisement
        </span>
        <span className="text-[11px] text-[#6B7280] mt-1">
          300 x 250
        </span>
      </div>

      {/* Lower 300x600 Half Page Ad Slot */}
      <div 
        id="ad-slot-300x600"
        className="w-[300px] h-[600px] bg-[#F9FAFB] border border-dashed border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center p-4 transition-colors select-none shrink-0 xl:sticky xl:top-6"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
          Advertisement
        </span>
        <span className="text-[11px] text-[#6B7280] mt-1">
          300 x 600
        </span>
      </div>
    </div>
  );
}
