"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string; // We will pass our aspect ratios and rounded corners through this!
}

export default function ParallaxImage({
  src,
  alt,
  className = "",
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track the scroll progress of this specific image container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // "start end" = top of container meets bottom of viewport
    // "end start" = bottom of container meets top of viewport
    offset: ["start end", "end start"],
  });

  // Map the scroll progress to a physical Y translation.
  // It moves from -15% to 15% as you scroll past it.
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* We make the inner motion.div 130% height and offset it by -15%.
        This guarantees that even when parallaxing, the edges never show!
      */}
      <motion.div
        style={{ y }}
        className="absolute inset-x-0 -top-[15%] h-[130%] w-full origin-center"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </motion.div>
    </div>
  );
}
