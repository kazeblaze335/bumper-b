"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

const SHOWREEL_DATA = [
  {
    id: "01",
    title: "Creative Direction",
    subtitle: "Guiding the vision.",
    videoSrc: "/videos/showcase-reel-1.mp4",
    fallbackImg: "/images/project-1.jpg",
  },
  {
    id: "02",
    title: "Interactive Design",
    subtitle: "Tactile web experiences.",
    videoSrc: "/videos/showcase-reel-2.mp4",
    fallbackImg: "/images/project-2.jpg",
  },
  {
    id: "03",
    title: "Hardware WebGL",
    subtitle: "Pushing the pixels.",
    videoSrc: "/videos/showcase-reel-3.mp4",
    fallbackImg: "/images/project-3.jpg",
  },
  {
    id: "04",
    title: "Motion & 3D",
    subtitle: "Kinetic storytelling.",
    videoSrc: "/videos/showcase-reel-4.mp4",
    fallbackImg: "/images/project-4.jpg",
  },
  {
    id: "05",
    title: "Product Architecture",
    subtitle: "Systems that scale.",
    videoSrc: "/videos/showcase-reel-5.mp4",
    fallbackImg: "/images/project-5.jpg",
  },
  {
    id: "06",
    title: "Creative Engineering",
    subtitle: "Code as a medium.",
    videoSrc: "/videos/showcase-reel-6.mp4",
    fallbackImg: "/images/project-6.jpg",
  },
];

// --- NEW: Scroll-Linked Split Text Character ---
const AnimatedChar = ({
  char,
  index,
  total,
  scrollYProgress,
  start,
}: {
  char: string;
  index: number;
  total: number;
  scrollYProgress: any;
  start: number;
}) => {
  // The text animation happens during the first 5% of this section's scroll
  const revealStart = start;
  const revealEnd = start + 0.05;

  // Calculate the micro-stagger for this specific letter
  const step = (revealEnd - revealStart) / total;
  const charStart = revealStart + step * index;
  const charEnd = charStart + 0.02; // It takes exactly 2% of scroll to lift one letter

  const y = useTransform(scrollYProgress, [charStart, charEnd], ["120%", "0%"]);

  return (
    <span className="relative inline-block overflow-hidden pt-2 pb-6 -mt-2 -mb-6">
      <motion.span style={{ y }} className="inline-block whitespace-pre">
        {char}
      </motion.span>
    </span>
  );
};

const ParallaxItem = ({
  item,
  index,
  scrollYProgress,
  total,
}: {
  item: any;
  index: number;
  scrollYProgress: any;
  total: number;
}) => {
  const start = index / total;
  const end = (index + 1) / total;

  // 1. The Razor Line Clip-Path
  const clipX = useTransform(scrollYProgress, [start, end], [15, 0]);
  const clipY = useTransform(scrollYProgress, [start, end], [49.95, 0]);
  const clipPath = useMotionTemplate`inset(${clipY}% ${clipX}% ${clipY}% ${clipX}%)`;

  // 2. The Video Scale
  const scale = useTransform(scrollYProgress, [start, end], [3, 1]);

  // 3. The Soft Fade-In Overlap
  const opacity = useTransform(
    scrollYProgress,
    [index === 0 ? 0 : start - 0.05, index === 0 ? 0 : start],
    [index === 0 ? 1 : 0, 1],
  );

  // 4. Subtitle & Global Typography Parallax
  const textY = useTransform(scrollYProgress, [start, end], ["0%", "-20%"]);
  const textOpacity = useTransform(
    scrollYProgress,
    [
      index === 0 ? 0 : start,
      index === 0 ? 0 : start + 0.05,
      index === total - 1 ? 1 : end - 0.05,
      index === total - 1 ? 1 : end,
    ],
    [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0],
  );

  // Track absolute letter index across multiple words for perfect staggering
  let absoluteCharIndex = 0;
  const totalChars = item.title.replace(/\s/g, "").length;

  return (
    <motion.div
      style={{ opacity, zIndex: index }}
      className="absolute inset-0 w-full h-full flex items-center justify-center"
    >
      <motion.div
        style={{ clipPath }}
        className="absolute inset-0 w-full h-full bg-zinc-950 shadow-2xl"
      >
        <motion.div style={{ scale }} className="w-full h-full origin-center">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={item.fallbackImg}
            className="w-full h-full object-cover filter brightness-75 md:brightness-[0.85]"
          >
            <source src={item.videoSrc} type="video/mp4" />
          </video>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: textY, opacity: textOpacity, zIndex: 100 + index }}
        className="absolute inset-0 w-full h-full flex flex-col justify-between p-8 md:p-16 pointer-events-none text-white"
      >
        <div className="flex justify-between items-start w-full">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase drop-shadow-md">
            Index — {item.id}
          </span>
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase drop-shadow-md">
            2024
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full pb-8">
          {/* THE FIX: Implemented the Scroll-Linked Split Text */}
          <h2 className="text-[12vw] md:text-[8vw] font-black font-neue leading-[0.85] tracking-tighter uppercase max-w-[80%] drop-shadow-xl flex flex-wrap">
            {item.title.split(" ").map((word: string, wIndex: number) => (
              <span key={wIndex} className="inline-flex mr-[0.25em]">
                {word.split("").map((char: string, cIndex: number) => {
                  const currentIndex = absoluteCharIndex++;
                  return (
                    <AnimatedChar
                      key={cIndex}
                      char={char}
                      index={currentIndex}
                      total={totalChars}
                      scrollYProgress={scrollYProgress}
                      start={start}
                    />
                  );
                })}
              </span>
            ))}
          </h2>

          <p className="mt-4 md:mt-0 text-sm md:text-xl font-medium tracking-tight drop-shadow-lg">
            {item.subtitle}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function InfiniteParallaxHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[1200vh] bg-zinc-100 dark:bg-zinc-950"
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-zinc-950">
        {SHOWREEL_DATA.map((item, index) => (
          <ParallaxItem
            key={item.id}
            item={item}
            index={index}
            scrollYProgress={scrollYProgress}
            total={SHOWREEL_DATA.length}
          />
        ))}
      </div>
    </section>
  );
}
