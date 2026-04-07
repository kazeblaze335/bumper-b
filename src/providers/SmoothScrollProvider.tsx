"use client";

import { ReactNode, useEffect, useRef } from "react";
import Lenis from "lenis";
import { useStore } from "@/store/useStore";

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const isScrollLocked = useStore((state) => state.isScrollLocked);

  useEffect(() => {
    // Initialize standard Lenis smooth scrolling for the site
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // --- THE ZUSTAND AIR TRAFFIC CONTROLLER ---
  // Listens for the lock signal and safely disables/enables scrolling
  useEffect(() => {
    if (isScrollLocked) {
      lenisRef.current?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenisRef.current?.start();
      document.body.style.overflow = "auto";
    }

    // Failsafe cleanup in case the component unmounts while locked
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isScrollLocked]);

  return <>{children}</>;
}
