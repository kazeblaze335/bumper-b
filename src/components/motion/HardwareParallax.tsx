"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HardwareParallaxProps {
  children: React.ReactNode;
  speed?: number; // e.g., 0.1 for subtle, 0.3 for intense
  className?: string;
  isPaused?: boolean; // We use this to pause math during page transitions
}

export default function HardwareParallax({
  children,
  speed = 0.15,
  className = "",
  isPaused = false,
}: HardwareParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  // useScroll natively tracks when this specific element enters/exits the viewport
  // This is highly optimized using native Intersection Observers under the hood
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Map the intersection progress (0 to 1) to a percentage offset for the parallax
  // If speed is 0.15, the image will travel from -15% to +15% on the Y axis
  const yOffset = speed * 100;
  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${yOffset}%`, `${yOffset}%`],
  );

  // If the page is animating/transitioning, we freeze the parallax to save GPU power
  const y = isPaused ? "0%" : rawY;

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ y }}
        // 1. transform-gpu forces hardware acceleration
        // 2. will-change-transform tells the browser to prep the GPU
        // 3. scale-[1.15] gives the image extra height so it can slide without showing gaps
        className="absolute inset-0 w-full h-full scale-[1.15] transform-gpu will-change-transform origin-center"
      >
        {children}
      </motion.div>
    </div>
  );
}
