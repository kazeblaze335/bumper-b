"use client";
import { useEffect } from "react";
import { tunnel } from "@/providers/TunnelProvider";
import { useStore } from "@/store/useStore";
import UnifiedScene from "@/components/webgl/UnifiedScene";
import OverlayUI from "@/components/ui/OverlayUI";

export default function ArchivePage() {
  const { setScrollLocked, setActiveLayout, activeLayout } = useStore();
  const isLensMode = activeLayout === "layout-4-lens";

  useEffect(() => {
    // Lock native scrolling and hijack the wheel for WebGL
    setScrollLocked(true);

    // Trigger the scattered WebGL layout on mount
    setActiveLayout("layout-1-gallery");

    // Restore standard routing behavior when leaving the page
    return () => {
      setScrollLocked(false);
    };
  }, [setScrollLocked, setActiveLayout]);

  return (
    <main className="fixed inset-0 w-full h-screen overflow-hidden bg-[#e5e5e5]">
      {/* --- Z-[50]: THE TWIN WHITE BOXES --- */}
      {/* Must be > 40 to sit ON TOP of the WebGL Canvas and act as a mask! */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] h-[40vh] flex z-[50] pointer-events-none transition-opacity duration-700"
        style={{ opacity: isLensMode ? 1 : 0 }}
      >
        <div className="w-[32.5%] h-full bg-white shadow-[20px_0_40px_rgba(0,0,0,0.05)]" />
        <div className="w-[35%] h-full bg-transparent" />
        <div className="w-[32.5%] h-full bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.05)]" />
      </div>

      {/* --- Z-[40]: THE WEBGL TELEPORTER --- */}
      {/* Renders in the GlobalCanvas behind the white boxes */}
      <tunnel.In>
        <UnifiedScene />
      </tunnel.In>

      {/* --- Z-[60]: THE TYPOGRAPHY --- */}
      {/* Top of the DOM Sandwich to ensure absolute clickability */}
      <div className="absolute inset-0 z-[60] pointer-events-none">
        <OverlayUI />
      </div>
    </main>
  );
}
