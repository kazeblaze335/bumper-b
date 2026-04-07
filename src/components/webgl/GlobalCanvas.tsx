"use client";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { tunnel } from "@/providers/TunnelProvider";
import { useEffect, useState } from "react";

export default function GlobalCanvas() {
  // We safely grab the document body only after the component mounts (Next.js SSR safe)
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setEventSource(document.body);
  }, []);

  return (
    // PERMANENTLY set to pointer-events-none so it NEVER blocks your HTML!
    <div className="fixed inset-0 z-[40] pointer-events-none">
      <Canvas
        style={{ pointerEvents: "none" }}
        // SECRET WEAPON: Tell WebGL to listen to the document body for interactions!
        eventSource={eventSource || undefined}
        eventPrefix="client"
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
        }}
        camera={{ position: [0, 0, 5], fov: 75 }}
        frameloop="always"
      >
        <tunnel.Out />
        <Preload all />
      </Canvas>
    </div>
  );
}
