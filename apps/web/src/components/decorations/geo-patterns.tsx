"use client";

export default function GeoPatterns() {
  return (
    <>
      {/* Top-right, large dot grid */}
      <svg className="fixed top-12 right-4 pointer-events-none z-0 opacity-[0.055]" width="200" height="200" viewBox="0 0 200 200">
        {Array.from({ length: 100 }, (_, i) => (
          <circle key={i} cx={10 + (i % 10) * 20} cy={10 + Math.floor(i / 10) * 20} r="2.5" fill="currentColor" />
        ))}
      </svg>

      {/* Bottom-left, wind swirl */}
      <svg className="fixed bottom-20 left-6 pointer-events-none z-0 opacity-[0.05]" width="180" height="180" viewBox="0 0 180 180">
        <path d="M20,90 Q50,30 90,50 T160,40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M10,120 Q60,60 100,80 T170,70" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M30,150 Q70,100 110,110 T165,100" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
        <circle cx="160" cy="40" r="4" fill="currentColor" opacity="0.3" />
        <circle cx="170" cy="70" r="3" fill="currentColor" opacity="0.2" />
      </svg>

      {/* Left side, scattered diamonds */}
      <svg className="fixed top-1/4 left-4 pointer-events-none z-0 opacity-[0.04]" width="60" height="240" viewBox="0 0 60 240">
        {[30, 70, 110, 150, 190, 230].map((y, i) => (
          <g key={i} transform={`translate(30, ${y}) rotate(45)`}>
            <rect x="-7" y="-7" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </g>
        ))}
      </svg>

      {/* Top center, horizontal dashes */}
      <svg className="fixed top-16 left-1/3 pointer-events-none z-0 opacity-[0.04]" width="400" height="10" viewBox="0 0 400 10">
        {Array.from({ length: 20 }, (_, i) => (
          <line key={i} x1={i * 20 + 2} y1="5" x2={i * 20 + 14} y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        ))}
      </svg>

      {/* Right side, concentric circles (air/atmosphere) */}
      <svg className="fixed top-1/2 right-8 -translate-y-1/2 pointer-events-none z-0 opacity-[0.04]" width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="75" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="80" cy="80" r="55" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <circle cx="80" cy="80" r="35" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="80" cy="80" r="15" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <circle cx="80" cy="80" r="4" fill="currentColor" opacity="0.15" />
      </svg>

      {/* Bottom-right, triangle scatter */}
      <svg className="fixed bottom-12 right-16 pointer-events-none z-0 opacity-[0.04]" width="140" height="120" viewBox="0 0 140 120">
        <polygon points="30,8 50,42 10,42" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <polygon points="75,20 100,60 50,60" fill="none" stroke="currentColor" strokeWidth="1" />
        <polygon points="45,55 65,90 25,90" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <polygon points="100,50 125,85 75,85" fill="none" stroke="currentColor" strokeWidth="0.8" />
      </svg>

      {/* Mid-left, organic scatter dots */}
      <svg className="fixed bottom-1/3 left-1/5 pointer-events-none z-0 opacity-[0.03]" width="120" height="120" viewBox="0 0 120 120">
        {[[15,20],[48,12],[82,28],[22,58],[55,48],[92,65],[35,88],[68,95],[105,42],[10,100]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill="currentColor" />
        ))}
      </svg>

      {/* Top-left, wavy wind lines */}
      <svg className="fixed top-28 left-20 pointer-events-none z-0 opacity-[0.045]" width="250" height="30" viewBox="0 0 250 30">
        <path d="M0,15 Q30,5 60,15 T120,15 T180,15 T240,15" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M10,25 Q40,15 70,25 T130,25 T190,25 T250,25" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
      </svg>

      {/* Center-right, plus signs */}
      <svg className="fixed top-2/3 right-6 pointer-events-none z-0 opacity-[0.035]" width="50" height="200" viewBox="0 0 50 200">
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`translate(25, ${15 + i * 25})`}>
            <line x1="-7" y1="0" x2="7" y2="0" stroke="currentColor" strokeWidth="1.3" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" strokeWidth="1.3" />
          </g>
        ))}
      </svg>
    </>
  );
}
