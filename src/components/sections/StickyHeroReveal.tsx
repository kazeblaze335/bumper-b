"use client";

import { motion, useTransform, useMotionValue } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import ClunkyReveal from "@/components/motion/ClunkyReveal";

interface StickyHeroRevealProps {
  title?: string;
  subtitle?: string;
  showTrademark?: boolean;
}

export default function StickyHeroReveal({
  title = "SOJU",
  subtitle = "Scroll to discover",
  showTrademark = true,
}: StickyHeroRevealProps) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  const scrollProgress = useStore((state) => state.scrollProgress);
  const motionScroll = useMotionValue(scrollProgress);

  useEffect(() => {
    motionScroll.set(scrollProgress);
  }, [scrollProgress, motionScroll]);

  useEffect(() => {
    setIsReady(false);
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 150);
    return () => clearTimeout(timer);
  }, [pathname]);

  const sojuOpacity = useTransform(motionScroll, [0, 0.5], [1, 0]);
  const sojuScale = useTransform(motionScroll, [0, 1], [1, 0.85]);
  const sojuY = useTransform(motionScroll, [0, 1], ["0%", "20%"]);

  return (
    <div className="h-screen w-full sticky top-0 flex flex-col items-center justify-center overflow-hidden bg-zinc-200 dark:bg-zinc-900 transition-colors duration-500 z-0 isolate transform-gpu">
      <motion.div
        style={{
          scale: sojuScale,
          opacity: isReady ? sojuOpacity : 1,
          y: sojuY,
        }}
        // Added font-black and ensured font-neue is present!
        className={`flex flex-row items-start justify-center text-[22vw] leading-[0.75] tracking-tight uppercase text-zinc-900 dark:text-zinc-100 font-neue font-black whitespace-nowrap`}
      >
        <ClunkyReveal key={`text-${pathname}`} text={title} delay={0.2} />

        {showTrademark && (
          <motion.span
            key={`tm-${pathname}`}
            initial={{ opacity: 0, scale: 0, rotateY: -180, rotateZ: -45 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, rotateZ: 0 }}
            transition={{
              delay: 1.0,
              type: "spring",
              stiffness: 200,
              damping: 12,
            }}
            style={{ transformStyle: "preserve-3d" }}
            // Restored the 8vw size for the trademark symbol
            className="text-[8vw] align-top relative top-2 md:top-4 ml-2 inline-block"
          >
            ®
          </motion.span>
        )}
      </motion.div>
      <motion.p
        key={`${pathname}-subtitle`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.8 }}
        style={{ opacity: isReady ? sojuOpacity : 1 }}
        className="absolute bottom-12 text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-400"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
