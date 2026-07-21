"use client";

import { useState } from "react";

const SHOWN_CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
  "Pune", "Lucknow", "Jaipur", "Ahmedabad", "Patna", "Chandigarh",
  "Bhopal", "Bhubaneswar", "Raipur", "Srinagar",
];

const ALL_CITIES = [
  ...SHOWN_CITIES,
  "Dehradun", "Shimla", "Amritsar", "Agra", "Kanpur", "Varanasi",
  "Gorakhpur", "Prayagraj", "Gwalior", "Jodhpur", "Indore", "Nagpur",
  "Coimbatore", "Madurai", "Kochi", "Mangalore", "Mysore", "Surat",
  "Rajkot", "Vadodara", "Nashik", "Aurangabad", "Visakhapatnam",
  "Vijayawada", "Warangal", "Ranchi", "Guwahati", "Imphal", "Shillong",
  "Aizawl", "Kohima", "Gangtok", "Itanagar", "Agartala", "Panaji",
  "Jammu", "Leh", "Jabalpur", "Thiruvananthapuram", "Tiruchirappalli",
  "Bhopal",
];

interface CitySelectorProps {
  selected: string;
  onChange: (city: string) => void;
  label?: string;
  showAll?: boolean;
}

export default function CitySelector({ selected, onChange, label, showAll }: CitySelectorProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = ALL_CITIES.filter(c =>
    c.toLowerCase().includes(query.toLowerCase()) && !SHOWN_CITIES.includes(c)
  );

  return (
    <div>
      {label && <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2">{label}</p>}
      <div className="flex gap-2 flex-wrap">
        {showAll && (
          <button
            onClick={() => { onChange("All India"); setSearchOpen(false); }}
            className={`px-3 py-1.5 rounded-full text-[12px] transition-all ${
              selected === "All India"
                ? "bg-foreground text-background shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontVariationSettings: selected === "All India" ? "'wght' 620" : "'wght' 440" }}
          >
            all india
          </button>
        )}
        {SHOWN_CITIES.map((c) => (
          <button
            key={c}
            onClick={() => { onChange(c); setSearchOpen(false); }}
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
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="w-8 h-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-all flex items-center justify-center text-[16px] font-mono"
          title="Search from 57 available cities"
        >
          {searchOpen ? "×" : "+"}
        </button>
        <span className="text-[10px] text-muted-foreground self-center font-mono">+41 more</span>
      </div>

      {searchOpen && (
        <div className="mt-3 bg-card border border-border rounded-2xl p-3 shadow-lg" style={{ maxWidth: 360 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search city..."
            autoFocus
            className="w-full bg-secondary rounded-full px-4 py-2 text-[14px] outline-none placeholder:text-muted-foreground/50 mb-2"
            style={{ fontVariationSettings: "'wght' 460" }}
          />
          <div className="max-h-[160px] overflow-y-auto flex flex-wrap gap-1.5">
            {filtered.length > 0 ? filtered.map((c) => (
              <button
                key={c}
                onClick={() => { onChange(c); setSearchOpen(false); setQuery(""); }}
                className="px-3 py-1.5 rounded-full text-[12px] bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                style={{ fontVariationSettings: "'wght' 460" }}
              >
                {c.toLowerCase()}
              </button>
            )) : (
              <p className="text-[12px] text-muted-foreground px-2 py-1">no cities found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { SHOWN_CITIES as CITIES, ALL_CITIES };
