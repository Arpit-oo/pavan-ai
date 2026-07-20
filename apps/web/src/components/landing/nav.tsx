"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ACCENT } from "./ui";

/**
 * Sticky condensing nav: hidden while the hero (with its own nav) is in view,
 * then slides down as a compact frosted cream bar once the user scrolls past
 * it. Gives the page persistent navigation without fighting the hero.
 */

const NAV = [
  { label: "the problem", href: "#stakes" },
  { label: "what it does", href: "#does" },
  { label: "how it works", href: "#pipeline" },
  { label: "proof", href: "#proof" },
];

export function StickyNav() {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-50"
      initial={false}
      animate={reduce ? { opacity: show ? 1 : 0 } : { y: show ? 0 : -80, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.4, ease: [0.21, 0.6, 0.35, 1] }}
      style={{ pointerEvents: show ? "auto" : "none" }}
    >
      <div className="border-b border-black/8 bg-[#f5f0e6]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[62px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-baseline gap-[1px] text-[22px]" style={{ fontVariationSettings: "'wght' 720, 'wdth' 94" }}>
            pavan<span style={{ color: ACCENT }}>.</span>
          </Link>
          <div className="hidden items-center gap-[28px] text-[14px] text-muted-foreground md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="transition-colors hover:text-foreground">
                {n.label}
              </a>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-[40px] items-center rounded-full px-[18px] text-[14px] font-medium transition-transform hover:-translate-y-[1px]"
            style={{ background: "#12110f", color: "#f5f0e6" }}
          >
            open dashboard →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
