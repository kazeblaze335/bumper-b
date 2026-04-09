"use client";

import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import { LayoutEngines } from "./LayoutEngines";

const lerp = (start: number, end: number, amt: number) =>
  (1 - amt) * start + amt * end;
const map = (
  num: number,
  min1: number,
  max1: number,
  min2: number,
  max2: number,
) => ((num - min1) / (max1 - min1)) * (max2 - min2) + min2;

const S = {
  Easing: {
    Power1InOut: (m: number) => -0.5 * (Math.cos(Math.PI * m) - 1),
    Power2InOut: (m: number) => (m < 0.5 ? 2 * m * m : -1 + (4 - 2 * m) * m),
  },
};

const IMAGE_COUNT = 14;
const imageUrls = Array.from(
  { length: IMAGE_COUNT },
  (_, i) => `/assets/images/image_${String(i + 1).padStart(3, "0")}.webp`,
);

function GalleryImage({
  index,
  url,
  positions,
}: {
  index: number;
  url: string;
  positions: React.MutableRefObject<any[]>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(url);

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  useFrame(() => {
    if (!meshRef.current) return;
    const { activeLayout, activeProject } = useStore.getState();

    let target: any = { x: 0, y: 0, z: 0, scale: 1, rotX: 0, rotY: 0 };

    if (activeLayout === "layout-1-gallery") {
      target = LayoutEngines.getLayout1(index, positions.current);
    } else if (activeLayout === "layout-2-gallery") {
      target = LayoutEngines.getLayout2(
        index,
        activeProject * 2.5,
        positions.current,
        IMAGE_COUNT * 2.5,
        0,
      );
    } else if (activeLayout === "layout-3-gallery") {
      target = LayoutEngines.getLayout3(
        index,
        activeProject * 3,
        3,
        0.5,
        IMAGE_COUNT * 3.5,
        0,
      );
    } else if (activeLayout === "layout-4-lens") {
      const spacingY = 4.5;
      target = LayoutEngines.getLayout4(index, activeProject, spacingY);

      const distanceFromCenter = Math.abs(target.y);
      const normalizedDist = map(distanceFromCenter, 0, spacingY, 0, 1);
      const clampedDist = Math.max(0, Math.min(1, normalizedDist));
      const centerWeight = S.Easing.Power2InOut(1 - clampedDist);

      target.z = 2.5 + centerWeight * 0.4;
      target.scale = 0.38 + centerWeight * 0.04;
      target.rotX = target.y * 0.05 * S.Easing.Power1InOut(clampedDist);
    }

    const friction = 0.06;
    meshRef.current.position.x = lerp(
      meshRef.current.position.x,
      target.x,
      friction,
    );
    meshRef.current.position.y = lerp(
      meshRef.current.position.y,
      target.y,
      friction,
    );
    meshRef.current.position.z = lerp(
      meshRef.current.position.z,
      target.z,
      friction,
    );
    meshRef.current.rotation.x = lerp(
      meshRef.current.rotation.x,
      target.rotX,
      friction,
    );
    meshRef.current.rotation.y = lerp(
      meshRef.current.rotation.y,
      target.rotY,
      friction,
    );

    const currentScale = meshRef.current.scale.x / 3;
    const newScale = lerp(currentScale, target.scale, friction);
    meshRef.current.scale.set(3 * newScale, 4 * newScale, 1);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <meshBasicMaterial map={texture} transparent={true} toneMapped={false} />
    </mesh>
  );
}

export default function UnifiedScene() {
  const positions = useRef(
    Array.from({ length: IMAGE_COUNT }).map(() => ({
      x: (Math.random() - 0.5) * 12,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 6,
      scale: 0.6 + Math.random() * 0.4,
      rowOffset: Math.random() * 10,
    })),
  );

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const { isScrollLocked, activeLayout, activeProject } =
        useStore.getState();
      if (!isScrollLocked || activeLayout === "layout-4-lens") return;

      if (e.deltaY > 20) {
        useStore.setState({
          activeProject: Math.min(activeProject + 1, IMAGE_COUNT - 1),
        });
      } else if (e.deltaY < -20) {
        useStore.setState({ activeProject: Math.max(activeProject - 1, 0) });
      }
    };

    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <group>
      {imageUrls.map((url, i) => (
        <GalleryImage key={url} index={i} url={url} positions={positions} />
      ))}
    </group>
  );
}
