"use client";

import { useRef, useEffect } from "react";
import { tunnel } from "@/providers/TunnelProvider";
import { useStore } from "@/store/useStore";
import HorizontalGLParallaxScene from "@/components/webgl/HorizontalGLParallaxScene";

const thumbnails = Array.from(
  { length: 14 },
  (_, i) => `/assets/images/image_${String(i + 1).padStart(3, "0")}.webp`,
);

// ==========================================
// 1. ISOLATED SHADOW TRACK (OPTIMIZED)
// ==========================================
function ShadowTrack() {
  const bgTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const totalProjects = thumbnails.length;
    const totalTravelVw = (totalProjects - 1) * 80;

    const unsub = useStore.subscribe((state) => {
      if (bgTrackRef.current) {
        bgTrackRef.current.style.transform = `translate3d(${-state.horizontalGlProgress * totalTravelVw}vw, 0, 0)`;
      }
    });
    return unsub;
  }, []);

  return (
    <div className="absolute inset-0 z-[10] flex items-center pointer-events-none opacity-20 dark:opacity-10">
      <div
        ref={bgTrackRef}
        className="flex items-center will-change-transform"
        style={{
          paddingLeft: "15vw",
          gap: "10vw",
          width: `${thumbnails.length * 80 + 30}vw`,
        }}
      >
        {thumbnails.map((src, i) => (
          // THE RESPONSIVE FIX: w-[85vw] h-[50vh] on mobile, stretching back to w-[70vw] h-[80vh] on tablet/desktop
          <div
            key={i}
            className="relative w-[85vw] h-[50vh] md:w-[70vw] md:h-[80vh] flex-shrink-0 grayscale"
          >
            {/* THE PERFORMANCE FIX: Added native loading="lazy" and decoding="async" to protect the browser thread */}
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 2. ISOLATED THUMBNAIL STRIP
// ==========================================
function ThumbnailStrip({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const activeProject = useStore((state) => state.activeProject);

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
    <div className="absolute bottom-8 md:bottom-10 left-0 w-full flex justify-center items-center gap-6 z-[99] px-8 pointer-events-auto">
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
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </button>
        );
      })}
    </div>
  );
}

// ==========================================
// 3. MAIN STATIC LAYOUT BLOCK
// ==========================================
export default function HorizontalGLParallaxBlock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

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

      const isGalleryActive = rect.top <= 50 && rect.bottom > 100;

      useStore.setState({
        horizontalGlProgress: progress,
        horizontalGlY: stickyRef.current.getBoundingClientRect().top,
        activeProject: activeIndex,
        isHorizontalGalleryActive: isGalleryActive,
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-[400vh] bg-zinc-100 dark:bg-zinc-950 transition-colors duration-500 z-20"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center"
      >
        <ShadowTrack />

        <tunnel.In>
          <HorizontalGLParallaxScene />
        </tunnel.In>

        <ThumbnailStrip containerRef={containerRef} />
      </div>
    </section>
  );
}
