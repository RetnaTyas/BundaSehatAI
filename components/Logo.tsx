import React from 'react';

interface LogoProps {
  className?: string;
  withText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", withText = false }) => {
  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" /> {/* rose-400 */}
            <stop offset="100%" stopColor="#e11d48" /> {/* rose-600 */}
          </linearGradient>
          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" /> {/* emerald-400 */}
            <stop offset="100%" stopColor="#059669" /> {/* emerald-600 */}
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Abstract Pregnant Mother / Heart Shape Base */}
        <path 
          d="M50 20 C 30 20, 10 35, 10 58 C 10 78, 35 92, 50 98 C 65 92, 90 78, 90 58 C 90 35, 70 20, 50 20 Z" 
          fill="url(#logoGradient)" 
          className="drop-shadow-sm"
        />
        
        {/* Inner Negative Space creating the 'Belly' curve */}
        <path 
          d="M50 28 C 35 28, 22 40, 22 58 C 22 75, 40 85, 50 88" 
          stroke="white" 
          strokeWidth="6" 
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
        
        {/* The Leaf (Nutrition/Health Symbol) */}
        <path 
          d="M50 20 C 50 20, 45 5, 65 5 C 80 5, 80 25, 50 20" 
          fill="url(#leafGradient)" 
        />
      </svg>
      
      {withText && (
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Bunda<span className="text-rose-500">Sehat</span>
        </h1>
      )}
    </div>
  );
};