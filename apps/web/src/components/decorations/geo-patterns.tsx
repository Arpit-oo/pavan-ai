"use client";

export default function GeoPatterns() {
  return (
    <>
      {/* Top-right dot grid — bigger, more visible */}
      <svg
        className="fixed top-16 right-6 pointer-events-none z-0 opacity-[0.045]"
        width="160" height="160" viewBox="0 0 160 160"
      >
        {Array.from({ length: 64 }, (_, i) => (
          <circle
            key={i}
            cx={10 + (i % 8) * 20}
            cy={10 + Math.floor(i / 8) * 20}
            r="2.5"
            fill="currentColor"
          />
        ))}
      </svg>

      {/* Bottom-left concentric rings */}
      <svg
        className="fixed bottom-24 left-4 pointer-events-none z-0 opacity-[0.04]"
        width="140" height="140" viewBox="0 0 140 140"
      >
        <circle cx="70" cy="70" r="65" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="70" cy="70" r="45" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <circle cx="70" cy="70" r="25" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="70" cy="70" r="8" fill="currentColor" opacity="0.3" />
      </svg>

      {/* Mid-left — scattered diamonds */}
      <svg
        className="fixed top-1/3 left-3 pointer-events-none z-0 opacity-[0.035]"
        width="60" height="180" viewBox="0 0 60 180"
      >
        {[20, 55, 90, 125, 160].map((y, i) => (
          <g key={i} transform={`translate(30, ${y}) rotate(45)`}>
            <rect x="-5" y="-5" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </g>
        ))}
      </svg>

      {/* Top-left — wavy line */}
      <svg
        className="fixed top-32 left-16 pointer-events-none z-0 opacity-[0.04]"
        width="200" height="20" viewBox="0 0 200 20"
      >
        <path
          d="M0 10 Q25 2, 50 10 T100 10 T150 10 T200 10"
          stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"
        />
      </svg>

      {/* Right side — cross pattern */}
      <svg
        className="fixed top-1/2 right-3 -translate-y-1/2 pointer-events-none z-0 opacity-[0.03]"
        width="50" height="250" viewBox="0 0 50 250"
      >
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i} transform={`translate(25, ${15 + i * 25})`}>
            <line x1="-6" y1="0" x2="6" y2="0" stroke="currentColor" strokeWidth="1.3" />
            <line x1="0" y1="-6" x2="0" y2="6" stroke="currentColor" strokeWidth="1.3" />
          </g>
        ))}
      </svg>

      {/* Bottom-right — triangle cluster */}
      <svg
        className="fixed bottom-16 right-12 pointer-events-none z-0 opacity-[0.035]"
        width="120" height="100" viewBox="0 0 120 100"
      >
        <polygon points="30,5 50,40 10,40" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <polygon points="70,15 95,55 45,55" fill="none" stroke="currentColor" strokeWidth="1" />
        <polygon points="40,50 60,85 20,85" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <polygon points="80,45 100,75 60,75" fill="none" stroke="currentColor" strokeWidth="0.8" />
      </svg>

      {/* Scattered dots — organic feel */}
      <svg
        className="fixed bottom-1/3 left-1/4 pointer-events-none z-0 opacity-[0.025]"
        width="100" height="100" viewBox="0 0 100 100"
      >
        {[[15,20],[45,10],[75,30],[25,60],[55,50],[85,70],[35,85],[65,90],[10,45],[90,15]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r={1.5 + (i % 3)} fill="currentColor" />
        ))}
      </svg>

      {/* Top center — horizontal dashes */}
      <svg
        className="fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none z-0 opacity-[0.03]"
        width="300" height="8" viewBox="0 0 300 8"
      >
        {Array.from({ length: 15 }, (_, i) => (
          <line key={i} x1={i * 20 + 5} y1="4" x2={i * 20 + 15} y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        ))}
      </svg>
    </>
  );
}
