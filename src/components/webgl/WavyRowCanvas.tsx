"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame, extend, ReactThreeFiber } from "@react-three/fiber";
import { shaderMaterial, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { lerp } from "@/utils/math";

const WavyShader = shaderMaterial(
  {
    uHoverState: 0,
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uTexture: new THREE.Texture(),
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float uHoverState;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform sampler2D uTexture;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      float dist = distance(uv, uMouse);
      float distortion = sin(uv.y * 10.0 + uTime * 2.0) * 0.05;

      if (dist < 0.3 * uHoverState) {
          float strength = 1.0 - (dist / (0.3 * uHoverState));
          uv.x += distortion * strength * uHoverState;
          uv.y += sin(uTime * 4.0 + dist * 20.0) * 0.02 * strength * uHoverState;
      }
      
      vec4 finalColor = texture2D(uTexture, uv);
      gl_FragColor = vec4(finalColor.rgb, uHoverState * 0.95);
    }
  `,
);

extend({ WavyShader });

declare global {
  namespace ReactThreeFiber {
    interface IntrinsicElements {
      wavyShader: ReactThreeFiber.Object3DNode<
        THREE.ShaderMaterial,
        typeof WavyShader
      >;
    }
  }
}

function WavyImagePlane({
  activeImage,
  isHovered,
  isExpanding,
}: {
  activeImage: string;
  isHovered: boolean;
  isExpanding: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const targetHover = useRef(0);
  const mouseLerp = useRef(new THREE.Vector2(0.5, 0.5));

  const texture = useTexture(activeImage);

  useEffect(() => {
    targetHover.current = isHovered || isExpanding ? 1 : 0;
  }, [isHovered, isExpanding]);

  useFrame((state, delta) => {
    if (materialRef.current && meshRef.current) {
      const nextHover = lerp(
        materialRef.current.uniforms.uHoverState.value,
        targetHover.current,
        0.08,
      );
      materialRef.current.uniforms.uHoverState.value = nextHover;
      materialRef.current.uniforms.uTime.value += delta;

      const currentMouse = new THREE.Vector2(
        state.pointer.x * 0.5 + 0.5,
        state.pointer.y * 0.5 + 0.5,
      );
      mouseLerp.current.x = lerp(
        mouseLerp.current.x,
        isExpanding ? 0.5 : currentMouse.x,
        0.1,
      );
      mouseLerp.current.y = lerp(
        mouseLerp.current.y,
        isExpanding ? 0.5 : currentMouse.y,
        0.1,
      );
      materialRef.current.uniforms.uMouse.value.copy(mouseLerp.current);

      const targetWidth = isExpanding ? state.viewport.width : 16;
      const targetHeight = isExpanding ? state.viewport.height : 3.5;

      meshRef.current.scale.x = lerp(
        meshRef.current.scale.x,
        targetWidth,
        0.08,
      );
      meshRef.current.scale.y = lerp(
        meshRef.current.scale.y,
        targetHeight,
        0.08,
      );
    }
  });

  return (
    <mesh ref={meshRef} scale={[16, 3.5, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <wavyShader
        ref={materialRef}
        uTexture={texture}
        transparent={true}
        depthTest={false}
      />
    </mesh>
  );
}

export default function WavyRowCanvas({
  activeImage,
  isHovered,
  isExpanding,
}: {
  activeImage: string;
  isHovered: boolean;
  isExpanding: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 z-10 w-full h-full pointer-events-none transition-opacity duration-300 ${isExpanding ? "fixed h-screen z-50" : ""}`}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <WavyImagePlane
          activeImage={activeImage}
          isHovered={isHovered}
          isExpanding={isExpanding}
        />
      </Canvas>
    </div>
  );
}
