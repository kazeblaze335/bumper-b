"use client";

import { useRef, useMemo, useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { Center, Text3D } from "@react-three/drei";
import { useScroll, useMotionValueEvent } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";

// ==========================================
// 1. THE GLSL SHADERS
// ==========================================
const vertexShader = `
  uniform float uTime;
  uniform float uDistortion;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float elevation = sin(pos.x * 3.0 + uTime) * sin(pos.y * 2.0 + uTime) * uDistortion;
    pos.z += elevation;
    vElevation = elevation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vElevation;

  void main() {
    float mixStrength = (vElevation + 0.5) * 0.8;
    vec3 color = mix(uColorA, uColorB, mixStrength);
    gl_FragColor = vec4(color, 0.4); 
  }
`;

// ==========================================
// 2. THE MAIN SCENE COMPONENT
// ==========================================
export default function WebGLScene() {
  const shaderPlaneRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Refs for our 3D typography
  const letterRefs = useRef<THREE.Mesh[]>([]);
  const trademarkRef = useRef<THREE.Mesh>(null);

  const pathname = usePathname();
  const { scrollYProgress, scrollY } = useScroll();

  const title = pathname === "/work" ? "PROJECTS" : "SOJU";
  const letters = title.split("");
  const showTrademark = title === "SOJU";

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDistortion: { value: 0.6 },
      uColorA: { value: new THREE.Color("#18181b") },
      uColorB: { value: new THREE.Color("#3f3f46") },
    }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * 0.5;
    }
  });

  // THE GSAP WEBGL ANIMATION ENGINE
  useEffect(() => {
    if (letterRefs.current.length === 0) return;

    // 1. Reset the letters
    gsap.set(letterRefs.current, {
      "rotation.x": Math.PI * 0.7,
      "position.y": -4,
    });

    // 2. Reset the Trademark (Fix: Safely target the Vector3 axes!)
    if (trademarkRef.current) {
      gsap.set(trademarkRef.current, {
        "scale.x": 0,
        "scale.y": 0,
        "scale.z": 0,
        "rotation.y": -Math.PI,
        "rotation.z": -Math.PI / 4,
      });
    }

    const timer = setTimeout(() => {
      // 3. Fire the Text
      gsap.to(letterRefs.current, {
        "rotation.x": 0,
        "position.y": 0,
        duration: 1.2,
        ease: "back.out(1.2)",
        stagger: {
          each: 0.08,
          from: "end",
        },
      });

      // 4. Fire the Trademark Flourish (Fix: Safely restore the Vector3 axes!)
      if (trademarkRef.current) {
        gsap.to(trademarkRef.current, {
          "scale.x": 1,
          "scale.y": 1,
          "scale.z": 1,
          "rotation.y": 0,
          "rotation.z": 0,
          duration: 1.5,
          ease: "elastic.out(1, 0.4)",
          delay: 0.6,
        });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname, title]);

  // SCROLL LOGIC
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (shaderPlaneRef.current) {
      shaderPlaneRef.current.rotation.z = (latest / 1000) * Math.PI;
    }

    if (latest > 150) {
      gsap.to(letterRefs.current, { "position.y": -4, duration: 0.5 });
      if (trademarkRef.current) {
        gsap.to(trademarkRef.current, {
          "scale.x": 0,
          "scale.y": 0,
          "scale.z": 0,
          duration: 0.5,
        });
      }
    } else if (latest <= 10) {
      gsap.to(letterRefs.current, {
        "position.y": 0,
        "rotation.x": 0,
        duration: 0.8,
      });
      if (trademarkRef.current) {
        gsap.to(trademarkRef.current, {
          "scale.x": 1,
          "scale.y": 1,
          "scale.z": 1,
          "rotation.y": 0,
          "rotation.z": 0,
          duration: 0.8,
        });
      }
    }
  });

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[0, 5, 5]} intensity={2} />

      <Suspense fallback={null}>
        <Center position={[0, 0, 1]}>
          <group>
            {letters.map((char, index) => (
              <Text3D
                key={`${title}-${index}`}
                ref={(el) => {
                  if (el) letterRefs.current[index] = el;
                }}
                font="/fonts/neue-montreal-bold.json"
                size={2.5}
                height={0.2}
                curveSegments={12}
                bevelEnabled
                bevelThickness={0.02}
                bevelSize={0.02}
                bevelOffset={0}
                bevelSegments={5}
                position={[index * 2.2, 0, 0]}
              >
                {char}
                <meshStandardMaterial color="#f4f4f5" />
              </Text3D>
            ))}

            {showTrademark && (
              <Text3D
                ref={trademarkRef}
                font="/fonts/neue-montreal-bold.json"
                size={1.0}
                height={0.1}
                bevelEnabled
                bevelThickness={0.01}
                bevelSize={0.01}
                position={[letters.length * 2.2 - 0.5, 1.8, 0]}
              >
                ®
                <meshStandardMaterial color="#f4f4f5" />
              </Text3D>
            )}
          </group>
        </Center>
      </Suspense>

      <mesh
        ref={shaderPlaneRef}
        rotation={[-Math.PI / 4, 0, 0]}
        position={[0, 0, -2]}
        scale={[1.5, 1.5, 1.5]}
      >
        <planeGeometry args={[12, 12, 128, 128]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          wireframe={true}
          transparent={true}
        />
      </mesh>
    </>
  );
}
