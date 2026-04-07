"use client";

import {
  motion,
  AnimatePresence,
  Variants,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { triggerPaperPushTransition } from "@/utils/animations";
import React from "react";

const heightAnim: Variants = {
  initial: { height: "0vh" },
  enter: (i: number) => ({
    height: "100vh",
    transition: { duration: 0.5, delay: 0.05 * i, ease: [0.76, 0, 0.24, 1] },
  }),
  exit: (i: number) => ({
    height: "0vh",
    transition: { duration: 0.5, delay: 0.05 * i, ease: [0.76, 0, 0.24, 1] },
  }),
};

// Cleaned up the core animation object to natively use -120% for the exit!
const charAnim: Variants = {
  initial: { y: "100%" },
  enter: (i: number) => ({
    y: "0%",
    transition: {
      duration: 0.8,
      delay: 0.4 + i * 0.02,
      ease: [0.76, 0, 0.24, 1],
    },
  }),
  exit: (i: number) => ({
    y: "-120%", // Increased target guarantees it clears the tighter top mask
    opacity: 0,
    transition: { duration: 0.3, delay: i * 0.01, ease: [0.76, 0, 0.24, 1] },
  }),
};

const opacityAnim: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.5, delay: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const NAV_LINKS = [
  { title: "Home", href: "/" },
  { title: "Projects", href: "/work" },
  { title: "Agency", href: "/about" },
];

export default function StairsMenu({
  isOpen,
  closeMenu,
}: {
  isOpen: boolean;
  closeMenu: () => void;
}) {
  const router = useTransitionRouter();
  const pathname = usePathname();

  // --- MAGNETIC CURSOR LOGIC FOR CLOSE BUTTON ---
  const closeX = useMotionValue(0);
  const closeY = useMotionValue(0);

  const closeXSpring = useSpring(closeX, {
    stiffness: 150,
    damping: 15,
    mass: 0.1,
  });
  const closeYSpring = useSpring(closeY, {
    stiffness: 150,
    damping: 15,
    mass: 0.1,
  });

  const handleCloseMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const hX = e.clientX - (rect.left + rect.width / 2);
    const hY = e.clientY - (rect.top + rect.height / 2);
    closeX.set(hX * 0.5);
    closeY.set(hY * 0.5);
  };

  const handleCloseMouseLeave = () => {
    closeX.set(0);
    closeY.set(0);
  };
  // ----------------------------------------------

  const handleNavigation =
    (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (pathname === path) {
        closeMenu();
        return;
      }
      closeMenu();
      setTimeout(() => {
        router.push(path, {
          onTransitionReady: () => triggerPaperPushTransition(),
        });
      }, 600);
    };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col justify-between">
          <div className="absolute inset-0 flex z-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                custom={5 - i}
                variants={heightAnim}
                initial="initial"
                animate="enter"
                exit="exit"
                className="w-1/5 h-full bg-[#CCFF00]"
              />
            ))}
          </div>

          {/* THE MAGNETIC CLOSE HIT AREA */}
          <div
            className="absolute top-0 right-0 z-10 w-48 h-48 md:w-64 md:h-64 pointer-events-auto flex items-start justify-end"
            onMouseMove={handleCloseMouseMove}
            onMouseLeave={handleCloseMouseLeave}
          >
            {/* The Close Button with cursor-pointer restored */}
            <motion.button
              style={{ x: closeXSpring, y: closeYSpring }}
              variants={opacityAnim}
              initial="initial"
              animate="enter"
              exit="exit"
              onClick={closeMenu}
              className="group flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-transparent hover:scale-105 transition-transform duration-500 cursor-pointer"
            >
              <span className="mb-2 text-xs font-bold tracking-[0.2em] uppercase leading-none hover:opacity-50 transition-opacity text-zinc-900">
                Close
              </span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 68 68"
                fill="none"
                className="transform transition-transform group-hover:rotate-90 duration-500 text-zinc-900"
              >
                <path
                  d="M1.5 1.5L67 67"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  d="M66.5 1L0.999997 66.5"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
            </motion.button>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center flex-1 pointer-events-auto text-zinc-900 gap-6 mt-24 px-12 md:px-24">
            {NAV_LINKS.map((link, linkIndex) => {
              const staggerOffset = linkIndex * 5;

              return (
                <a
                  key={link.title}
                  href={link.href}
                  onClick={handleNavigation(link.href)}
                  className="group flex items-center justify-center overflow-hidden border border-transparent group-hover:border-zinc-900 px-8 md:px-16 py-4 md:py-6 relative transition-all duration-300 rounded-lg"
                >
                  {/* FIX: Asymmetrical mask. pt-0/pb-0 strictly hides the bottom text, -mt-4 pushes the top safety margin up */}
                  <div className="flex overflow-hidden pt-0 pb-0 px-8 -mt-4 -mb-0 -mx-8">
                    {link.title.split("").map((char, charIndex) => (
                      <motion.span
                        key={charIndex}
                        custom={charIndex + staggerOffset}
                        variants={charAnim}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        className="relative inline-block"
                        style={{ whiteSpace: char === " " ? "pre" : "normal" }}
                      >
                        {/* The Staggered Slot Machine Roll */}
                        <span
                          className="block transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full"
                          style={{ transitionDelay: `${charIndex * 0.02}s` }}
                        >
                          {/* Top Character (Default) */}
                          <span className="block text-6xl md:text-8xl font-black font-neue tracking-tighter uppercase leading-none pr-[0.1em]">
                            {char}
                          </span>
                          {/* Bottom Character (Italic & Faded) */}
                          <span className="absolute left-0 top-full block text-6xl md:text-8xl font-black font-neue tracking-tighter uppercase leading-none pr-[0.1em] italic opacity-60">
                            {char}
                          </span>
                        </span>
                      </motion.span>
                    ))}
                  </div>
                </a>
              );
            })}
          </div>

          <div className="relative z-10 w-full p-8 flex justify-center gap-8 pointer-events-auto text-zinc-900 font-bold tracking-[0.2em] uppercase text-xs">
            <motion.a
              variants={opacityAnim}
              initial="initial"
              animate="enter"
              exit="exit"
              href="#"
              className="hover:opacity-50 transition-opacity"
            >
              Instagram
            </motion.a>
            <motion.a
              variants={opacityAnim}
              initial="initial"
              animate="enter"
              exit="exit"
              href="#"
              className="hover:opacity-50 transition-opacity"
            >
              Twitter
            </motion.a>
            <motion.a
              variants={opacityAnim}
              initial="initial"
              animate="enter"
              exit="exit"
              href="#"
              className="hover:opacity-50 transition-opacity"
            >
              LinkedIn
            </motion.a>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
