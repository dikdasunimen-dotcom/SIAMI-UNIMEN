import React from 'react';

interface UnimenLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon' | 'badge';
  showSubtext?: boolean;
  className?: string;
}

export const UnimenLogo: React.FC<UnimenLogoProps> = ({
  size = 'md',
  variant = 'full',
  showSubtext = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', textTitle: 'text-xs', textSub: 'text-[9px]', star: 'w-2 h-2' },
    md: { icon: 'w-12 h-12', textTitle: 'text-sm', textSub: 'text-[10px]', star: 'w-2.5 h-2.5' },
    lg: { icon: 'w-16 h-16', textTitle: 'text-base', textSub: 'text-xs', star: 'w-3 h-3' },
    xl: { icon: 'w-20 h-20', textTitle: 'text-lg', textSub: 'text-xs', star: 'w-4 h-4' },
    '2xl': { icon: 'w-28 h-28', textTitle: 'text-xl', textSub: 'text-sm', star: 'w-5 h-5' },
  };

  const currentSize = sizeMap[size];

  // Official UNIMEN & Muhammadiyah Insignia with Dual Gold & Muhammadiyah Green Border
  const LogoEmblem = (
    <div
      className={`relative ${currentSize.icon} shrink-0 rounded-full flex items-center justify-center p-0.5 shadow-md ${className}`}
      style={{
        // Outer double gold border with Muhammadiyah green core
        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 40%, #B45309 70%, #FBBF24 100%)',
        boxShadow: '0 4px 14px 0 rgba(217, 119, 6, 0.35), inset 0 1px 2px 0 rgba(255, 255, 255, 0.6)'
      }}
    >
      {/* Inner Gold Concentric Frame */}
      <div className="w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-emerald-950 via-emerald-800 to-teal-900 flex items-center justify-center">
        {/* Fine Gold Beaded Ring */}
        <div className="w-full h-full rounded-full border border-amber-300/80 p-0.5 flex items-center justify-center bg-gradient-to-b from-emerald-800 to-emerald-950 relative overflow-hidden">
          {/* Subtle Islamic Geometric Radial Aura */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:6px_6px]" />

          {/* SVG: 12-Ray Golden Sun of Muhammadiyah (Surya 12 Sinar Emas) */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full relative z-10 drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Decorative Ring */}
            <circle cx="50" cy="50" r="46" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="2 1.5" />
            <circle cx="50" cy="50" r="43" stroke="#F59E0B" strokeWidth="1" />
            
            {/* 12 Radiant Rays of Muhammadiyah Sun */}
            {[...Array(12)].map((_, i) => {
              const angle = i * 30;
              return (
                <g key={i} transform={`rotate(${angle} 50 50)`}>
                  {/* Primary Diamond/Triangle Ray */}
                  <polygon
                    points="50,6 53.5,24 50,22 46.5,24"
                    fill="url(#goldGradient)"
                    filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.2))"
                  />
                  {/* Minor Ray */}
                  <polygon
                    points="50,13 52,23 48,23"
                    fill="#FEF08A"
                    opacity="0.85"
                  />
                </g>
              );
            })}

            {/* Inner Circular Seal */}
            <circle cx="50" cy="50" r="26" fill="#047857" stroke="#FBBF24" strokeWidth="1.8" />
            <circle cx="50" cy="50" r="22.5" fill="#064E3B" stroke="#F59E0B" strokeWidth="0.8" />

            {/* Central Muhammadiyah 5-pointed Star with Calligraphic Emblem */}
            <g transform="translate(50, 50)">
              {/* Star */}
              <polygon
                points="0,-10 2.9,-3.1 9.5,-3.1 4.2,1.2 6.2,8 0,4.2 -6.2,8 -4.2,1.2 -9.5,-3.1 -2.9,-3.1"
                fill="url(#goldGradient)"
                stroke="#78350F"
                strokeWidth="0.5"
              />
              {/* Central Light Dot */}
              <circle cx="0" cy="0" r="2.2" fill="#FEF3C7" />
            </g>

            {/* Gradients */}
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="30%" stopColor="#FBBF24" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );

  if (variant === 'icon') {
    return LogoEmblem;
  }

  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-900/90 border border-amber-400/50 text-white shadow-sm">
        {LogoEmblem}
        <div className="text-left">
          <span className="block text-[11px] font-bold tracking-tight text-amber-300">
            UNIMEN ENREKANG
          </span>
          <span className="block text-[9px] text-emerald-200">
            Sekolah Pascasarjana • LPM
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {LogoEmblem}
      <div className="text-left">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h1 className={`font-extrabold tracking-tight text-slate-900 ${currentSize.textTitle}`}>
            UNIVERSITAS MUHAMMADIYAH ENREKANG
          </h1>
        </div>
        {showSubtext && (
          <div className="space-y-0.5">
            <p className={`font-bold tracking-wide text-emerald-800 flex items-center gap-1.5 ${currentSize.textSub}`}>
              <span>Sekolah Pascasarjana</span>
              <span className="text-amber-500 font-extrabold">•</span>
              <span>Lembaga Penjaminan Mutu (LPM)</span>
            </p>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight">
              Sistem Informasi Audit Mutu Internal (SIAMI) • PPEPP Permendiktisaintek 39/2025
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
