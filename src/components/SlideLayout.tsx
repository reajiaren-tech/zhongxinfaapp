import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const SlideLayout: React.FC<Props> = ({ children, className = '', title }) => {
  return (
    <div className={`w-full h-full flex flex-col p-3 md:p-8 relative overflow-hidden bg-white/50 ${className}`}>
      
      {/* Header with School Branding */}
      <div className="flex justify-between items-center border-b-2 border-blue-900/10 pb-2 md:pb-4 mb-2 md:mb-6 z-20 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-800 rounded-sm flex items-center justify-center text-white font-bold text-[10px] md:text-xs">
            GRT
          </div>
          <span className="text-blue-900 font-bold tracking-wider text-xs md:text-sm opacity-80">广州铁路职业技术学院 | 集装箱教研室 R SUN</span>
        </div>
        <div className="text-[10px] md:text-xs text-gray-400 font-mono hidden sm:block">物流与供应链: 重心法迭代</div>
      </div>

      {title && (
        <div className="mb-2 md:mb-6 z-10 flex items-center gap-2 md:gap-4 flex-shrink-0">
          <div className="w-1.5 md:w-2 h-6 md:h-10 bg-orange-500 rounded-full"></div>
          <h2 className="text-2xl md:text-4xl font-cute text-blue-800 drop-shadow-sm tracking-wider">
            {title}
          </h2>
        </div>
      )}

      {/* Content Area - Enable scrolling if content overflows */}
      <div className="flex-1 relative z-10 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
        {children}
      </div>

      {/* Simple Footer Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 md:h-2 bg-blue-900 z-20"></div>
    </div>
  );
};