"use client";

export default function GeoPatterns() {
  return (
    <div className="geo-dots">
      {/* Top-right dot grid */}
      <svg
        className="fixed top-20 right-8 opacity-[0.03]"
        width="120" height="120" viewBox="0 0 120 120"
      >
        {Array.from({ length: 36 }, (_, i) => (
          <circle
            key={i}
            cx={10 + (i % 6) * 20}
            cy={10 + Math.floor(i / 6) * 20}
            r="2"
            fill="currentColor"
          />
        ))}
      </svg>

      {/* Bottom-left circles */}
      <svg
        className="fixed bottom-32 left-6 opacity-[0.025]"
        width="80" height="80" viewBox="0 0 80 80"
      >
        <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="40" cy="40" r="25" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="40" cy="40" r="12" stroke="currentColor" strokeWidth="0.8" fill="none" />
      </svg>

      {/* Mid-right cross pattern */}
      <svg
        className="fixed top-1/2 right-4 opacity-[0.02] -translate-y-1/2"
        width="60" height="200" viewBox="0 0 60 200"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`translate(30, ${12 + i * 25})`}>
            <line x1="-5" y1="0" x2="5" y2="0" stroke="currentColor" strokeWidth="1.2" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="currentColor" strokeWidth="1.2" />
          </g>
        ))}
      </svg>

      {/* Top-left triangle scatter */}
      <svg
        className="fixed top-40 left-4 opacity-[0.02]"
        width="100" height="100" viewBox="0 0 100 100"
      >
        <polygon points="20,5 35,30 5,30" fill="none" stroke="currentColor" strokeWidth="1" />
        <polygon points="60,20 75,45 45,45" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <polygon points="30,55 45,80 15,80" fill="none" stroke="currentColor" strokeWidth="0.6" />
      </svg>
    </div>
  );
}
