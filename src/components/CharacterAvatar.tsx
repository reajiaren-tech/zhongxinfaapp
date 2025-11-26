import React, { useState } from 'react';
import { Character } from '../types';

interface Props {
  character: Character;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CharacterAvatar: React.FC<Props> = ({ character, size = 'md', className = '' }) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    if (isActive) return;
    setIsActive(true);
    // Reset after animation
    setTimeout(() => setIsActive(false), 600);
  };

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48'
  };

  const renderSvg = (active: boolean) => {
    switch (character) {
      case Character.LOCOMOTIVE:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <g transform="translate(0, 5)">
              {/* Smoke Stack */}
              <rect x="25" y="10" width="15" height="25" fill="#1E3A8A" stroke="#172554" strokeWidth="2" />
              <ellipse cx="32" cy="10" rx="10" ry="3" fill="#60A5FA" opacity="0.8" />
              
              {/* Steam Puffs (Visible when active) */}
              <g opacity={active ? 1 : 0} className="transition-opacity duration-300">
                 <circle cx="20" cy="5" r="4" fill="white" opacity="0.8" />
                 <circle cx="10" cy="0" r="6" fill="white" opacity="0.6" />
              </g>

              {/* Main Body */}
              <path d="M15 35 H85 V85 H15 Z" fill="#2563EB" stroke="#1E3A8A" strokeWidth="3" rx="5" />
              <path d="M15 35 H85 V60 H15 Z" fill="#3B82F6" stroke="none" />
              
              {/* Roof */}
              <path d="M10 35 H90 L85 28 H15 Z" fill="#1E40AF" stroke="#172554" strokeWidth="2" />
              
              {/* Face/Front Window */}
              <rect x="25" y="40" width="50" height="25" rx="5" fill="#E0F2FE" stroke="#60A5FA" strokeWidth="2" />
              
              {/* Eyes */}
              <circle cx="40" cy="50" r="4" fill="#1F2937" />
              {active ? (
                // Wink Eye
                <path d="M56 50 L60 48 L64 50" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
              ) : (
                // Normal Eye
                <circle cx="60" cy="50" r="4" fill="#1F2937" />
              )}
              
              {/* Smile */}
              <path 
                d={active ? "M45 58 Q50 66 55 58" : "M45 58 Q50 62 55 58"} 
                stroke="#1F2937" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                className="transition-all duration-300"
              />
              
              {/* Cowcatcher (Pilot) */}
              <path d="M15 85 L25 95 H75 L85 85" fill="#4B5563" stroke="#374151" strokeWidth="2" />
              <line x1="30" y1="85" x2="35" y2="95" stroke="white" strokeWidth="1" />
              <line x1="45" y1="85" x2="45" y2="95" stroke="white" strokeWidth="1" />
              <line x1="60" y1="85" x2="55" y2="95" stroke="white" strokeWidth="1" />
              <line x1="70" y1="85" x2="65" y2="95" stroke="white" strokeWidth="1" />
              
              {/* Wheels (Partial) */}
              <circle cx="25" cy="85" r="8" fill="#1F2937" stroke="#4B5563" strokeWidth="2" />
              <circle cx="75" cy="85" r="8" fill="#1F2937" stroke="#4B5563" strokeWidth="2" />
            </g>
          </svg>
        );
      case Character.CONTAINER:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
             <g transform="translate(0, 10)">
              {/* Container Body */}
              <rect x="15" y="20" width="70" height="60" rx="4" fill="#F97316" stroke="#C2410C" strokeWidth="3" />
              
              {/* Corrugated Lines */}
              <line x1="25" y1="20" x2="25" y2="80" stroke="#FB923C" strokeWidth="3" />
              <line x1="35" y1="20" x2="35" y2="80" stroke="#FB923C" strokeWidth="3" />
              <line x1="65" y1="20" x2="65" y2="80" stroke="#FB923C" strokeWidth="3" />
              <line x1="75" y1="20" x2="75" y2="80" stroke="#FB923C" strokeWidth="3" />
              
              {/* Corner Locks */}
              <rect x="13" y="18" width="8" height="8" fill="#9A3412" />
              <rect x="79" y="18" width="8" height="8" fill="#9A3412" />
              <rect x="13" y="74" width="8" height="8" fill="#9A3412" />
              <rect x="79" y="74" width="8" height="8" fill="#9A3412" />
              
              {/* Face Panel (White label area) */}
              <rect x="38" y="35" width="24" height="30" fill="#FFFFFF" rx="2" stroke="#E5E7EB" />
              
              {/* Face */}
              {active ? (
                 <>
                  {/* Happy Eyes */}
                  <path d="M43 45 Q45 43 47 45" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M53 45 Q55 43 57 45" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                 </>
              ) : (
                 <>
                  <circle cx="45" cy="45" r="2.5" fill="#1F2937" />
                  <circle cx="55" cy="45" r="2.5" fill="#1F2937" />
                 </>
              )}

              {/* Mouth */}
              <path 
                d={active ? "M46 54 Q50 62 54 54" : "M46 55 Q50 58 54 55"} 
                stroke="#1F2937" 
                strokeWidth="2" 
                fill={active ? "#FCA5A5" : "none"}
                strokeLinecap="round" 
                className="transition-all duration-300"
              />
              
              {/* Cheeks */}
              <circle cx="42" cy="50" r="3" fill="#FCA5A5" opacity={active ? "1" : "0.6"} />
              <circle cx="58" cy="50" r="3" fill="#FCA5A5" opacity={active ? "1" : "0.6"} />
            </g>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${className} 
        transform transition-all duration-300 
        cursor-pointer
        ${isActive ? '-translate-y-6 scale-110' : 'hover:-translate-y-1'}
      `}
      onClick={handleClick}
      title="点我互动！"
    >
      {renderSvg(isActive)}
    </div>
  );
};