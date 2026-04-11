"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import MagneticWrapper from "@/components/motion/MagneticWrapper";
import StairsMenu from "@/components/ui/StairsMenu";
import { useStore } from "@/store/useStore";
import localFont from "next/font/local";

// Using next-view-transitions to ensure a seamless, app-like crossfade
import { Link } from "next-view-transitions";

const neueMontreal = localFont({
  src: "../../../public/fonts/PPNeueMontreal-Bold.otf",
  variable: "--font-neue",
});

export default function NavBar() {
  const { scrollYProgress } = useScroll();
  const [isHidden, setIsHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Pull the tripwire from the global Zustand store
  const isGalleryActive = useStore((state) => state.isHorizontalGalleryActive);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Hide the navbar if scrolling very close to the bottom of the page
    if (latest > 0.95) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: "0px" },
          hidden: { y: "-200px" },
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        className="fixed top-0 left-0 w-full z-50 flex justify-between items-start pointer-events-none"
      >
        {/* LEFT: Logo */}
        <div className="pointer-events-auto px-6 py-8 md:px-12 mix-blend-difference text-zinc-100">
          <MagneticWrapper>
            <Link
              href="/"
              className={`block text-xl md:text-2xl tracking-tighter uppercase hover:opacity-70 transition-opacity cursor-pointer ${neueMontreal.className}`}
            >
              SOJU
            </Link>
          </MagneticWrapper>
        </div>

        {/* RIGHT: The Brutalist Morphing Menu Button */}
        <div className="pointer-events-auto absolute top-0 right-0">
          <MagneticWrapper>
            <button
              type="button" // Prevents phantom page reloads on click
              onClick={() => setMenuOpen(!menuOpen)}
              className={`bg-[#CCFF00] text-zinc-950 flex items-center justify-center group transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white cursor-pointer ${
                isGalleryActive
                  ? "w-36 h-12 md:w-48 md:h-16 rounded-none flex-row gap-4 mt-0 mr-0" // The Flush Horizontal Rectangle
                  : "w-24 h-24 md:w-32 md:h-32 rounded-none flex-col gap-2 mt-0 mr-0" // The Monumental Square
              }`}
            >
              <span
                className={`font-bold tracking-[0.2em] uppercase transition-all duration-700 ${
                  isGalleryActive
                    ? "text-[10px] md:text-xs mt-0"
                    : "text-[10px] md:text-xs mt-1"
                }`}
              >
                MENU
              </span>

              <div
                className={`flex flex-col gap-[4px] items-center transition-all duration-700 ${
                  isGalleryActive ? "w-6 md:w-8 mt-0" : "w-6 md:w-8 mt-1"
                }`}
              >
                {/* Menu Hamburger Lines */}
                <div className="w-full h-[1px] bg-zinc-950" />
                <div className="w-2/3 h-[1px] bg-zinc-950 transition-all duration-300 group-hover:w-full" />
              </div>
            </button>
          </MagneticWrapper>
        </div>
      </motion.nav>

      {/* The Fullscreen Navigation Menu */}
      <StairsMenu isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />
    </>
  );
}
