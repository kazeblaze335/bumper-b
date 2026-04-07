"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function InteractiveVideoBlock({
  src,
  poster,
}: {
  src: string;
  poster: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [playing, setPlaying] = useState(false);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Increased damping to 30 to remove any micro-bounces from the physics engine
  const cursorXSpring = useSpring(cursorX, {
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  });
  const cursorYSpring = useSpring(cursorY, {
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  });

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      cursorX.jump(centerX);
      cursorY.jump(centerY);
      cursorXSpring.jump(centerX);
      cursorYSpring.jump(centerY);
    }
  }, [cursorX, cursorY, cursorXSpring, cursorYSpring]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!containerRef.current) return;

    // THE FIX: Intelligent Leave Logic
    // If the video is paused, we return the bubble to the center to act as a Play button.
    // If the video is PLAYING, we leave the coordinates exactly where they are at the edge!
    if (!playing) {
      const rect = containerRef.current.getBoundingClientRect();
      cursorX.set(rect.width / 2);
      cursorY.set(rect.height / 2);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlayPause}
      className="relative w-full aspect-video rounded-sm overflow-hidden bg-zinc-900 shadow-2xl cursor-none group"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        muted
        loop
        className={`absolute inset-0 w-full h-full object-cover scale-[1.02] opacity-80 transition-all duration-700 ${playing ? "grayscale-0" : "grayscale"}`}
      />

      <motion.div
        style={{ x: cursorXSpring, y: cursorYSpring }}
        className="pointer-events-none absolute top-0 left-0 z-50 mix-blend-difference"
      >
        <div
          className={`flex items-center justify-center w-24 h-24 md:w-28 md:h-28 -ml-12 -mt-12 md:-ml-14 md:-mt-14 bg-[#CCFF00] text-zinc-900 rounded-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
            isHovered
              ? "scale-100 opacity-100"
              : playing
                ? "scale-0 opacity-0" // If they leave while playing, it completely vanishes at the edge!
                : "scale-75 opacity-100" // If paused, it rests visibly in the center.
          }`}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase text-center leading-tight whitespace-pre-wrap">
            {playing ? "Pause\nVideo" : "Play\nVideo"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
