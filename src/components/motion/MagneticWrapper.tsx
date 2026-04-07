"use client";

import { useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function MagneticWrapper({
  children,
  strength = 0.2, // The multiplier for how far it pulls. 0.2 is subtle, 0.5 is extreme.
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // High stiffness, low damping creates that snappy, tactile "thwack"
  // when the mouse leaves and the button snaps back to center.
  const springConfig = { stiffness: 250, damping: 15, mass: 0.5 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();

    // Calculate the distance from the exact dead-center of the element
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    x.set(middleX * strength);
    y.set(middleY * strength);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Snap back to origin
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className="relative inline-flex items-center justify-center cursor-pointer"
    >
      {children}
    </motion.div>
  );
}
