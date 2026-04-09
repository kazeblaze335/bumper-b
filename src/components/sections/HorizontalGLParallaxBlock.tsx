"use client";

import { useRef, useEffect } from "react";
import { tunnel } from "@/providers/TunnelProvider";
import { useStore } from "@/store/useStore";
import HorizontalGLParallaxScene from "@/components/webgl/HorizontalGLParallaxScene";

const thumbnails = Array.from(
  { length: 14 },
  (_, i) => `/assets/images/image_${String(i + 1).padStart(3, "0")}.webp`,
);

export default function HorizontalGLParallaxBlock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const { activeProject, setActiveProject } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !stickyRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;

      let progress = -rect.top / scrollableDistance;
      progress = Math.max(0, Math.min(1, progress));

      const totalProjects = thumbnails.length;
      const activeIndex = Math.min(
        Math.floor(progress * totalProjects),
        totalProjects - 1,
      );

      useStore.setState({
        horizontalGlProgress: progress,
        horizontalGlY: stickyRef.current.getBoundingClientRect().top,
      });

      setActiveProject(activeIndex);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setActiveProject]);

  const handleThumbnailClick = (index: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollableDistance =
      containerRef.current.scrollHeight - window.innerHeight;
    const targetProgress = index / (thumbnails.length - 1);

    const absoluteY =
      window.scrollY + rect.top + targetProgress * scrollableDistance;
    window.scrollTo({ top: absoluteY, behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[400vh] bg-zinc-100 dark:bg-zinc-950 transition-colors duration-500 z-20"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center"
      >
        {/* Editorial Typography Overlay - Grouped closer to the top */}
        <div className="absolute top-8 left-8 md:left-16 z-[60] pointer-events-none">
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-500"></p>
        </div>

        {/* THUMBNAIL STRIP - Grouped tighter to the text to leave massive padding below */}
        <div className="absolute top-24 left-0 w-full flex justify-center items-center gap-6 z-[99] px-8 pointer-events-auto">
          {thumbnails.map((src, i) => {
            const isActive = i === activeProject;
            return (
              <button
                key={i}
                onClick={() => handleThumbnailClick(i)}
                className={`relative w-16 h-10 overflow-hidden transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "border-[1.5px] border-zinc-900 dark:border-zinc-100 scale-125 shadow-xl z-10"
                    : "border border-transparent opacity-40 scale-100 grayscale hover:opacity-80 hover:grayscale-0"
                }`}
              >
                <img
                  src={src}
                  alt={`Thumbnail ${i}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>

        {/* WebGL Teleporter */}
        <tunnel.In>
          <HorizontalGLParallaxScene />
        </tunnel.In>
      </div>
    </section>
  );
}
