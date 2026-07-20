"use client";

const CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
  "Pune", "Lucknow", "Jaipur", "Ahmedabad", "Patna", "Chandigarh",
  "Bhopal", "Bhubaneswar", "Raipur", "Srinagar",
];

interface CitySelectorProps {
  selected: string;
  onChange: (city: string) => void;
  label?: string;
}

export default function CitySelector({ selected, onChange, label }: CitySelectorProps) {
  return (
    <div>
      {label && <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2">{label}</p>}
      <div className="flex gap-2 flex-wrap">
        {CITIES.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`px-3 py-1.5 rounded-full text-[12px] transition-all ${
              selected === c
                ? "bg-foreground text-background shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontVariationSettings: selected === c ? "'wght' 620" : "'wght' 440" }}
          >
            {c.toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export { CITIES };
