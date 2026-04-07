"use client";

import { Suspense, useRef } from "react";
import { useThree, Canvas, useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";

const UndulatingText = () => {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // =======================================================
    // POSH & DEMONSTRATIVE UNDULATION
    // Applies a heavy, liquid breathing effect to the entire word block
    // =======================================================
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.15; // Vertical breathing
    groupRef.current.rotation.z = Math.sin(t * 1.2) * 0.03; // Gentle swaying
    groupRef.current.rotation.y = Math.cos(t * 0.8) * 0.08; // 3D depth panning
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* Main SOJU Text */}
        <Text
          position={[-viewport.width * 0.05, 0, 0]}
          fontSize={viewport.width * 0.22} // Matches the 25vw from your About page
          letterSpacing={-0.05}
          font="/fonts/PPNeueMontreal-Bold.otf"
          color="#ffffff" // White text + difference blend = automatic dark/light mode!
          anchorX="center"
          anchorY="middle"
        >
          SOJU
        </Text>

        {/* The Trademark Symbol */}
        <Text
          position={[viewport.width * 0.26, viewport.width * 0.08, 0]}
          fontSize={viewport.width * 0.08} // Proportional scaling
          font="/fonts/PPNeueMontreal-Bold.otf"
          color="#ffffff"
          anchorX="left"
          anchorY="bottom"
        >
          ®
        </Text>
      </group>
    </Float>
  );
};

export default function KineticTypography() {
  return (
    // mix-blend-difference is the secret weapon here!
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none mix-blend-difference">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <UndulatingText />
        </Suspense>
      </Canvas>
    </div>
  );
}
