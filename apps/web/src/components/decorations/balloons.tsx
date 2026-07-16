"use client";

import { useEffect, useState } from "react";

const BALLOON_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#2563eb", "#7c3aed", "#ec4899", "#2dd4bf",
  "#fb923c", "#a855f7",
];

interface Balloon {
  id: number;
  left: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
}

export default function FloatingBalloons() {
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  useEffect(() => {
    const initial: Balloon[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: 5 + (i * 17) + (i % 3) * 5,
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      size: 18 + (i % 4) * 6,
      duration: 25 + (i % 5) * 8,
      delay: i * 7,
    }));
    setBalloons(initial);
  }, []);

  return (
    <>
      {balloons.map((b) => (
        <div
          key={b.id}
          className="balloon"
          style={{
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        >
          <svg width={b.size} height={b.size * 1.2} viewBox="0 0 24 30">
            <ellipse cx="12" cy="11" rx="10" ry="11" fill={b.color} opacity="0.7" />
            <polygon points="12,22 10,26 14,26" fill={b.color} opacity="0.5" />
          </svg>
        </div>
      ))}
    </>
  );
}
