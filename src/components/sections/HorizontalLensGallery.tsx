"use client";
import { useRef, useEffect } from "react";
import { tunnel } from "@/providers/TunnelProvider";
import { useStore } from "@/store/useStore";
import UnifiedScene from "@/components/webgl/UnifiedScene";
import OverlayUI from "@/components/ui/OverlayUI"; // 1. Imported the Typography UI!

const thumbnails = Array.from(
  { length: 14 },
  (_, i) => `/assets/images/image_${String(i + 1).padStart(3, "0")}.webp`,
);

export default function HorizontalLensGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeProject, setActiveProject, setActiveLayout } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;

      let progress = -rect.top / scrollableDistance;
      progress = Math.max(0, Math.min(1, progress));

      const totalProjects = thumbnails.length;
      const activeIndex = Math.min(
        Math.floor(progress * totalProjects),
        totalProjects - 1,
      );

      useStore.setState({ galleryProgress: progress });
      setActiveProject(activeIndex);

      if (progress > 0.01 && progress < 0.99) {
        setActiveLayout("layout-4-lens");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setActiveProject, setActiveLayout]);

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
      className="relative h-[400vh] bg-[#e5e5e5] z-20"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        {/* Z-[40]: WebGL Teleporter (Sits BEHIND the white boxes) */}
        <tunnel.In>
          <UnifiedScene />
        </tunnel.In>

        {/* Z-[50]: The DOM Mask (Twin White Boxes sit ON TOP of WebGL) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] h-[40vh] flex z-[50] pointer-events-none">
          <div className="w-[32.5%] h-full bg-white shadow-[20px_0_40px_rgba(0,0,0,0.05)]" />
          <div className="w-[35%] h-full bg-transparent" />
          <div className="w-[32.5%] h-full bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.05)]" />
        </div>

        {/* Z-[60]: The Overlay UI (Typography on top of the mask) */}
        <div className="absolute inset-0 z-[60] pointer-events-none">
          <OverlayUI />
        </div>

        {/* Z-[70]: Thumbnail Selection Strip (Top layer for clicks) */}
        <div className="absolute bottom-12 left-0 w-full flex justify-center items-center gap-4 z-[70] px-8 pointer-events-auto">
          {thumbnails.map((src, i) => {
            const isActive = i === activeProject;
            return (
              <button
                key={i}
                onClick={() => handleThumbnailClick(i)}
                className={`relative w-16 h-10 overflow-hidden transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "border-[1.5px] border-black scale-125 shadow-xl z-10"
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
      </div>
    </section>
  );
}
