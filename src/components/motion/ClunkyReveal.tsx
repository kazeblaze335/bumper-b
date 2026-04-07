"use client";

import { motion, Variants } from "framer-motion";
import { useStore } from "@/store/useStore";

interface ClunkyRevealProps {
  text: string;
  delay?: number;
}

export default function ClunkyReveal({ text, delay = 0 }: ClunkyRevealProps) {
  const { isLoading } = useStore();
  const words = text.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay + 0.8,
      },
    },
  };

  const characterVariants: Variants = {
    hidden: {
      y: "150%",
      rotate: 10,
    },
    visible: {
      y: "0%",
      rotate: 0,
      transition: {
        type: "spring",
        damping: 14,
        stiffness: 150,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isLoading ? "hidden" : "visible"}
      className="flex whitespace-nowrap tracking-tighter uppercase font-neue font-bold"
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="flex mr-[0.25em] last:mr-0">
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              // THE FIX: Increased pt-8/-mt-8 to pt-32/-mt-32.
              // This gives the spring animation 128px of invisible headroom to bounce into!
              className="inline-block overflow-hidden pt-32 pb-12 px-4 -mt-32 -mb-12 -mx-4 -mr-[0.08em]"
            >
              <motion.span
                variants={characterVariants}
                className="inline-block pr-[0.08em] origin-bottom-left"
              >
                {char}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </motion.div>
  );
}
