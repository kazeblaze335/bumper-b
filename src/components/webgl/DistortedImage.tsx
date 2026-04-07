"use client";

import { useRef, useEffect, Suspense, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { tunnel } from "@/providers/TunnelProvider";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uHoverState;
  uniform float uTime;
  uniform vec2 uMouse;

  void main() {
    vec2 p = vUv;
    float dist = distance(p, uMouse);
    
    // Calculate a fluid ripple wave moving outward
    float ripple = sin(dist * 30.0 - uTime * 5.0) * 0.015;
    
    // Dampen the effect further away from the mouse
    float dampen = smoothstep(0.4, 0.0, dist) * uHoverState;
    
    // Push the UV coordinates along the wave vector
    vec2 dir = p - uMouse;
    if (length(dir) > 0.0) {
      dir = normalize(dir);
    }
    
    vec2 distortedUv = p + dir * ripple * dampen;

    gl_FragColor = texture2D(uTexture, distortedUv);
  }
`;

// --- THE INNER WEBGL MESH ---
function WebGLImageMesh({
  domRef,
  textureUrl,
  hoverRef,
  mouseRef,
}: {
  domRef: React.RefObject<HTMLDivElement | null>;
  textureUrl: string;
  hoverRef: React.MutableRefObject<boolean>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const texture = useTexture(textureUrl);

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uHoverState: { value: 0 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    [texture],
  );

  const { size, viewport } = useThree();

  useFrame((state, delta) => {
    if (!domRef.current || !meshRef.current || !materialRef.current) return;

    // Direct uniform mutations (Bypassing React rendering entirely)
    materialRef.current.uniforms.uTime.value += delta;

    // 1. Read silently from the refs instead of React State!
    const targetHover = hoverRef.current ? 1 : 0;
    materialRef.current.uniforms.uHoverState.value +=
      (targetHover - materialRef.current.uniforms.uHoverState.value) * 0.1;

    materialRef.current.uniforms.uMouse.value.x +=
      (mouseRef.current.x - materialRef.current.uniforms.uMouse.value.x) * 0.1;
    materialRef.current.uniforms.uMouse.value.y +=
      (mouseRef.current.y - materialRef.current.uniforms.uMouse.value.y) * 0.1;

    // DOM-to-WebGL Syncing Math
    const rect = domRef.current.getBoundingClientRect();
    const width = (rect.width / size.width) * viewport.width;
    const height = (rect.height / size.height) * viewport.height;
    const x =
      (rect.left / size.width) * viewport.width -
      viewport.width / 2 +
      width / 2;
    const y =
      -(rect.top / size.height) * viewport.height +
      viewport.height / 2 -
      height / 2;

    meshRef.current.scale.set(width, height, 1);
    meshRef.current.position.set(x, y, 0);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        toneMapped={false}
      />
    </mesh>
  );
}

// --- THE OUTER DOM COMPONENT ---
interface DistortedImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function DistortedImage({
  src,
  alt,
  className = "",
}: DistortedImageProps) {
  const domRef = useRef<HTMLDivElement>(null);

  // 2. THE FIX: Silent refs instead of noisy state variables
  const hoverRef = useRef(false);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (domRef.current) {
      const rect = domRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;

      // Update the silent ref! (No React re-renders triggered)
      mouseRef.current = { x, y };
    }
  };

  return (
    <>
      <div
        ref={domRef}
        onMouseEnter={() => {
          hoverRef.current = true;
        }}
        onMouseLeave={() => {
          hoverRef.current = false;
        }}
        onMouseMove={handleMouseMove}
        className={`relative w-full h-full opacity-0 ${className}`}
      >
        <span className="sr-only">{alt}</span>
      </div>

      <tunnel.In>
        <Suspense fallback={null}>
          <WebGLImageMesh
            domRef={domRef}
            textureUrl={src}
            hoverRef={hoverRef}
            mouseRef={mouseRef}
          />
        </Suspense>
      </tunnel.In>
    </>
  );
}
