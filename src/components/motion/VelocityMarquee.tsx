"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";

// Custom wrap function: keeps a value looping seamlessly between min and max
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export default function VelocityMarquee({ text }: { text: string }) {
  const baseX = useMotionValue(0);
  const directionFactor = useRef<number>(1);
  const { scrollY } = useScroll();

  const scrollVelocity = useVelocity(scrollY);
  // Reduced damping and stiffness slightly to stop the math from fighting the Lenis scroller
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 300,
  });

  // Toned down the max velocity multiplier so it doesn't jump too aggressively on fast scrolls
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 3], {
    clamp: false,
  });

  // FIX 1: The Flawless Wrap
  // Instead of a fragile -20 to -45 jump, we duplicate our text string perfectly in half.
  // We scroll from 0% to -50%. The exact moment we hit -50%, we jump back to 0%.
  // Because the first half and second half are identical, the human eye cannot see the jump!
  const x = useTransform(baseX, (v) => `${wrap(0, -50, v)}%`);

  useAnimationFrame((t, delta) => {
    // Base speed of the marquee
    let moveBy = directionFactor.current * -2 * (delta / 1000);

    // Determine scroll direction
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    // Add the scroll velocity boost
    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  // We repeat the text string multiple times to ensure it extends WAY past the screen bounds.
  // The first half (4 spans) and the second half (4 spans) create the perfect 50% mirror.
  const repeatedText = (
    <>
      <span className="block mr-12">{text}</span>
      <span className="block mr-12">{text}</span>
      <span className="block mr-12">{text}</span>
      <span className="block mr-12">{text}</span>
    </>
  );

  return (
    <div className="overflow-hidden flex whitespace-nowrap m-0 flex-nowrap leading-[0.85] tracking-tighter uppercase text-[16vw] font-bold text-zinc-900 dark:text-zinc-100">
      <motion.div
        className="flex whitespace-nowrap flex-nowrap transform-gpu will-change-transform"
        style={{ x }}
      >
        {/* Set 1: Represents 0% to 50% width */}
        <div className="flex">{repeatedText}</div>
        {/* Set 2: Represents 50% to 100% width */}
        <div className="flex">{repeatedText}</div>
      </motion.div>
    </div>
  );
}
