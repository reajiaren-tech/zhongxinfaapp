import React from 'react';

// A simple cloud shape for steam
export const SteamCloud: React.FC<{ x: string, y: string, scale?: number, delay?: number }> = ({ x, y, scale = 1, delay = 0 }) => (
  <svg 
    className="absolute opacity-40 animate-pulse" 
    style={{ 
      left: x, 
      top: y, 
      width: `${60 * scale}px`, 
      height: `${40 * scale}px`,
      color: "white",
      animationDuration: '4s',
      animationDelay: `${delay}s`
    }}
    viewBox="0 0 100 60" 
    fill="currentColor"
  >
    <path d="M20 50 Q10 50 10 40 Q10 20 30 20 Q40 5 60 15 Q80 5 90 25 Q100 25 95 45 Q90 55 70 55 L20 50 Z" />
  </svg>
);

// A gear icon for industry
export const Gear: React.FC<{ x: string, y: string, size?: number, spinDuration?: number }> = ({ x, y, size = 40, spinDuration = 10 }) => (
  <svg 
    className="absolute opacity-10 text-blue-900"
    style={{ 
      left: x, 
      top: y, 
      width: size, 
      height: size,
      animation: `spin ${spinDuration}s linear infinite`
    }}
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M20 12C20 11.42 19.91 10.87 19.75 10.35L22.11 8.5C22.33 8.33 22.39 8.03 22.25 7.79L20.25 4.32C20.11 4.08 19.8 4 19.54 4.09L16.76 5.21C16.18 4.77 15.54 4.4 14.86 4.12L14.44 1.16C14.4 0.88 14.16 0.68 13.88 0.68H9.88C9.6 0.68 9.36 0.88 9.32 1.16L8.9 4.12C8.22 4.4 7.58 4.77 7 5.21L4.22 4.09C3.96 4 3.65 4.08 3.51 4.32L1.51 7.79C1.37 8.03 1.43 8.33 1.65 8.5L4.01 10.35C3.85 10.87 3.76 11.42 3.76 12C3.76 12.58 3.85 13.13 4.01 13.65L1.65 15.5C1.43 15.67 1.37 15.97 1.51 16.21L3.51 19.68C3.65 19.92 3.96 20 4.22 19.91L7 18.79C7.58 19.23 8.22 19.6 8.9 19.88L9.32 22.84C9.36 23.12 9.6 23.32 9.88 23.32H13.88C14.16 23.32 14.4 23.12 14.44 22.84L14.86 19.88C15.54 19.6 16.18 19.23 16.76 18.79L19.54 19.91C19.8 20 20.11 19.92 20.25 19.68L22.25 16.21C22.39 15.97 22.33 15.67 22.11 15.5L19.75 13.65C19.91 13.13 20 12.58 20 12ZM12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17Z" />
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </svg>
);

export const RailTrack: React.FC<{ top: string, rotate?: number }> = ({ top, rotate = 0 }) => (
  <div 
    className="absolute w-full h-8 flex items-center justify-center opacity-10 pointer-events-none"
    style={{ top, transform: `rotate(${rotate}deg)` }}
  >
    <div className="w-full h-4 border-t-2 border-b-2 border-gray-600 relative">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="absolute h-6 w-2 bg-gray-500 top-[-6px]"
          style={{ left: `${i * 5 + 2}%` }}
        />
      ))}
    </div>
  </div>
);

export const BackgroundDecorations = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-grid-pattern">
      <SteamCloud x="5%" y="10%" scale={1.5} delay={0} />
      <SteamCloud x="80%" y="15%" scale={2} delay={2} />
      
      <Gear x="10%" y="70%" size={120} spinDuration={20} />
      <Gear x="85%" y="60%" size={180} spinDuration={30} />
      <Gear x="5%" y="20%" size={80} spinDuration={15} />

      <RailTrack top="90%" rotate={-2} />
      <RailTrack top="5%" rotate={2} />
    </div>
  );
};