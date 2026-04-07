"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import MagneticWrapper from "@/components/motion/MagneticWrapper";
import StairsMenu from "@/components/ui/StairsMenu";
import localFont from "next/font/local";
import Link from "next/link";

const neueMontreal = localFont({
  src: "../../../public/fonts/PPNeueMontreal-Bold.otf",
  variable: "--font-neue",
});

export default function NavBar() {
  const { scrollYProgress } = useScroll();
  const [isHidden, setIsHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
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
        {/* LEFT: Magnetic Logo (Toggle Removed, Back to Link) */}
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

        {/* RIGHT: Magnetic Neon Menu Square */}
        <div className="pointer-events-auto absolute top-0 right-0">
          <MagneticWrapper>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-24 h-24 md:w-32 md:h-32 bg-[#CCFF00] text-zinc-950 flex flex-col items-center justify-center gap-2 group transition-colors duration-500 hover:bg-white cursor-pointer"
            >
              <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mt-1">
                MENU
              </span>

              <div className="flex flex-col gap-[4px] w-6 md:w-8 items-center mt-1">
                <div className="w-full h-[1px] bg-zinc-950" />
                <div className="w-2/3 h-[1px] bg-zinc-950 transition-all duration-300 group-hover:w-full" />
              </div>
            </button>
          </MagneticWrapper>
        </div>
      </motion.nav>

      <StairsMenu isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />
    </>
  );
}
