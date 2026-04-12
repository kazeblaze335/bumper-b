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
  initial: { height: "0dvh" },
  enter: (i: number) => ({
    height: "100dvh",
    transition: { duration: 0.5, delay: 0.05 * i, ease: [0.76, 0, 0.24, 1] },
  }),
  exit: (i: number) => ({
    height: "0dvh",
    transition: { duration: 0.5, delay: 0.05 * i, ease: [0.76, 0, 0.24, 1] },
  }),
};

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
    y: "-120%",
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
  { title: "About", href: "/about" },
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
        <div className="fixed inset-0 z-[100] h-[100dvh] pointer-events-none flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 flex z-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                custom={5 - i}
                variants={heightAnim}
                initial="initial"
                animate="enter"
                exit="exit"
                // THE FIX: Added `origin-center scale-x-105` to force a tiny overlap and destroy sub-pixel gaps!
                className="w-1/5 bg-[#CCFF00] origin-center scale-x-105"
              />
            ))}
          </div>

          <div
            className="absolute top-0 right-0 z-10 w-32 h-32 md:w-64 md:h-64 pointer-events-auto flex items-start justify-end"
            onMouseMove={handleCloseMouseMove}
            onMouseLeave={handleCloseMouseLeave}
          >
            <motion.button
              style={{ x: closeXSpring, y: closeYSpring }}
              variants={opacityAnim}
              initial="initial"
              animate="enter"
              exit="exit"
              onClick={closeMenu}
              className="group flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-transparent hover:scale-105 transition-transform duration-500 cursor-pointer"
            >
              <span className="mb-1 md:mb-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase leading-none hover:opacity-50 transition-opacity text-zinc-900">
                Close
              </span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 68 68"
                fill="none"
                className="transform transition-transform group-hover:rotate-90 duration-500 text-zinc-900 w-5 h-5 md:w-6 md:h-6"
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

          <div className="relative z-10 flex flex-col items-center justify-center flex-1 pointer-events-auto text-zinc-900 gap-4 md:gap-6 mt-16 md:mt-24 px-6 md:px-24">
            {NAV_LINKS.map((link, linkIndex) => {
              const staggerOffset = linkIndex * 5;

              return (
                <a
                  key={link.title}
                  href={link.href}
                  onClick={handleNavigation(link.href)}
                  className="group flex items-center justify-center overflow-hidden border border-transparent group-hover:border-zinc-900 px-4 md:px-16 py-3 md:py-6 relative transition-all duration-300 rounded-lg"
                >
                  <div className="flex overflow-hidden pt-0 pb-0 px-4 md:px-8 -mt-2 md:-mt-4 -mb-0 -mx-4 md:-mx-8">
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
                        <span
                          className="block transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full"
                          style={{ transitionDelay: `${charIndex * 0.02}s` }}
                        >
                          <span className="block text-5xl md:text-8xl font-black font-neue tracking-tighter uppercase leading-none pr-[0.1em]">
                            {char}
                          </span>
                          <span className="absolute left-0 top-full block text-5xl md:text-8xl font-black font-neue tracking-tighter uppercase leading-none pr-[0.1em] italic opacity-60">
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

          <div className="relative z-10 w-full p-6 md:p-8 flex justify-center gap-6 md:gap-8 pointer-events-auto text-zinc-900 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs">
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
