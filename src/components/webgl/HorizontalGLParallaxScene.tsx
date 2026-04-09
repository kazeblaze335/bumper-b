"use client";

import * as THREE from "three";
import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { useTexture, shaderMaterial } from "@react-three/drei";
import { useStore } from "@/store/useStore";

const HorizontalParallaxMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uResolution: new THREE.Vector2(1, 1),
    uImageResolution: new THREE.Vector2(1, 1),
    uParallax: 0.0,
    uUvScale: 0.85,
    uShaderMultiplier: 1.0,
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform vec2 uImageResolution;
    uniform float uParallax;
    uniform float uUvScale;
    uniform float uShaderMultiplier;

    vec2 coverUv(vec2 uv, vec2 resolution, vec2 imageResolution) {
      vec2 ratio = vec2(
        min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
        min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
      );
      return vec2(
        uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        uv.y * ratio.y + (1.0 - ratio.y) * 0.5
      );
    }

    void main() {
      vec2 uv = coverUv(vUv, uResolution, uImageResolution);
      uv.x += uParallax * uShaderMultiplier; 
      uv -= 0.5;
      uv *= uUvScale; 
      uv += 0.5;
      vec3 col = texture2D(uTexture, uv).rgb;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
);
extend({ HorizontalParallaxMaterial });

const lerp = (start: number, end: number, amt: number) =>
  (1 - amt) * start + amt * end;

function ParallaxImage({
  url,
  index,
  total,
}: {
  url: string;
  index: number;
  total: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const texture = useTexture(url);
  const { viewport } = useThree();

  const isMobile = viewport.width < 5;
  const planeWidth = isMobile ? viewport.width * 0.75 : viewport.width * 0.38;
  const planeHeight = planeWidth * (3 / 4);
  const spacingX = planeWidth + (isMobile ? 0.5 : 1.5);

  useEffect(() => {
    if (texture && materialRef.current) {
      texture.colorSpace = THREE.SRGBColorSpace;
      const img = (texture as THREE.Texture).image as
        | { width?: number; height?: number }
        | HTMLImageElement
        | undefined;
      const imgWidth =
        img && typeof (img as any).width === "number" ? (img as any).width : 1;
      const imgHeight =
        img && typeof (img as any).height === "number" ? (img as any).height : 1;
      materialRef.current.uImageResolution.set(imgWidth, imgHeight);
      materialRef.current.uResolution.set(planeWidth, planeHeight);
    }
  }, [texture, planeWidth, planeHeight]);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    const { horizontalGlProgress } = useStore.getState();

    const totalTravel = (total - 1) * spacingX;
    const currentCameraX = horizontalGlProgress * totalTravel;
    const targetX = index * spacingX - currentCameraX;

    const normalizedDistance = targetX / (viewport.width / 2);
    const parallaxIntensity = 0.4;
    const targetParallax = normalizedDistance * parallaxIntensity;

    const friction = 0.08;
    meshRef.current.position.x = lerp(
      meshRef.current.position.x,
      targetX,
      friction,
    );
    materialRef.current.uParallax = lerp(
      materialRef.current.uParallax,
      targetParallax,
      friction,
    );
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[planeWidth, planeHeight, 32, 32]} />
      {/* @ts-ignore */}
      <horizontalParallaxMaterial ref={materialRef} uTexture={texture} />
    </mesh>
  );
}

// ==========================================
// SCENE ORCHESTRATOR
// ==========================================
export default function HorizontalGLParallaxScene() {
  const images = useMemo(() => {
    return Array.from(
      { length: 14 },
      (_, i) => `/assets/images/image_${String(i + 1).padStart(3, "0")}.webp`,
    );
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;

    const { horizontalGlY } = useStore.getState();

    // 1. Calculate the conversion ratio from CSS Pixels to WebGL Units
    const pixelToWebGlRatio = viewport.height / window.innerHeight;

    // 2. Base 5vh offset from earlier
    const baseOffset = viewport.height * 0.05;

    // 3. EXACT 23-PIXEL NUDGE
    const precisePixelOffset = 55 * pixelToWebGlRatio;

    // 4. Combine offsets for final target
    const totalVerticalOffset = baseOffset + precisePixelOffset;
    const targetY = -(horizontalGlY * pixelToWebGlRatio) - totalVerticalOffset;

    groupRef.current.position.y = targetY;
  });

  return (
    <group ref={groupRef}>
      {images.map((url, i) => (
        <ParallaxImage key={url} url={url} index={i} total={images.length} />
      ))}
    </group>
  );
}
