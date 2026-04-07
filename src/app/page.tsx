"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import FilmGrain from "@/components/ui/FilmGrain";
import VelocityMarquee from "@/components/motion/VelocityMarquee";
import StickyHeroReveal from "@/components/sections/StickyHeroReveal";
import SwissVideoBlock from "@/components/sections/SwissVideoBlock";
// 1. Import our new component!
import InfiniteParallaxHero from "@/components/sections/InfiniteParallaxHero";

export default function Home() {
  const [footerHeight, setFooterHeight] = useState(0);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setFooterHeight(entry.contentRect.height);
      }
    });
    if (footerRef.current) resizeObserver.observe(footerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <FilmGrain />
      <main className="relative bg-zinc-100 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 overflow-clip transition-colors duration-500">
        <Navbar />

        <div
          className="relative z-10 transition-colors duration-500"
          style={{ marginBottom: `${footerHeight}px` }}
        >
          {/* Section 1: The Initial Reveal */}
          <StickyHeroReveal
            title="SOJU"
            subtitle="Explore our universe"
            showTrademark={true}
          />

          <div className="relative z-10 bg-zinc-100 dark:bg-zinc-950 transition-colors duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
            {/* Section 2: The Infinite Parallax Showreel */}
            <InfiniteParallaxHero />

            {/* Section 3: The Swiss Video Block (Production Capabilities) */}
            <div className="w-full px-8 md:px-16 py-32 bg-zinc-100 dark:bg-zinc-950 relative z-20">
              <div className="flex justify-between items-end mb-12">
                <p className="text-sm font-bold tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-400 transition-colors duration-500">
                  Production Capabilities
                </p>
                <div className="hidden md:block w-1/3 h-[1px] bg-zinc-300 dark:bg-zinc-800" />
              </div>

              <SwissVideoBlock />
            </div>

            {/* Section 4: Keep Scrolling Trigger */}
            <div className="flex flex-col items-center justify-center py-32 text-center border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-500 overflow-hidden relative z-20 bg-zinc-100 dark:bg-zinc-950">
              <VelocityMarquee text="KEEP SCROLLING • " />

              <p className="mt-12 text-xl font-medium tracking-widest uppercase text-zinc-500 dark:text-zinc-400 transition-colors duration-500">
                The sticky footer awaits.
              </p>
            </div>
          </div>
        </div>

        {/* Floating Footer Layer */}
        <div
          ref={footerRef}
          className="fixed bottom-0 left-0 w-full z-0 pointer-events-none"
        >
          <div className="pointer-events-auto">
            <Footer />
          </div>

          <button
            onClick={scrollToTop}
            className="pointer-events-auto absolute bottom-8 right-8 md:bottom-12 md:right-16 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-all duration-500 z-50 group"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 transform group-hover:-translate-y-1 transition-transform duration-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 19V5M5 12l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      </main>
    </>
  );
}
