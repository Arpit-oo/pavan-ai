"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";

      if (!ready) {
        setReady(true);
        document.documentElement.classList.add("cursor-ready");
      }
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      animId = requestAnimationFrame(animate);
    };

    const onOver = (e: Event) => {
      dot.style.width = "12px";
      dot.style.height = "12px";
      ring.style.width = "36px";
      ring.style.height = "36px";
      ring.style.opacity = "0.25";
    };

    const onOut = (e: Event) => {
      dot.style.width = "8px";
      dot.style.height = "8px";
      ring.style.width = "28px";
      ring.style.height = "28px";
      ring.style.opacity = "0.15";
    };

    document.addEventListener("mousemove", onMove);

    const addHoverListeners = () => {
      document.querySelectorAll("a, button, [role='button'], .ru-bento, .ru-pill, input, textarea, .chat-fab, select").forEach(el => {
        el.addEventListener("mouseenter", onOver);
        el.addEventListener("mouseleave", onOut);
      });
    };

    addHoverListeners();
    const hoverInterval = setInterval(addHoverListeners, 3000);

    animId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("cursor-ready");
      cancelAnimationFrame(animId);
      clearInterval(hoverInterval);
    };
  }, [ready]);

  return (
    <>
      <div ref={dotRef} className="custom-cursor" style={{ left: -100, top: -100 }} />
      <div ref={ringRef} className="custom-cursor-ring" style={{ left: -100, top: -100 }} />
    </>
  );
}
