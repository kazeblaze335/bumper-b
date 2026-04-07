"use client";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { useTexture, shaderMaterial } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import { LayoutEngines } from "./LayoutEngines";

const FogSliderMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uDistortion: 0,
    uScale: 1.0,
    uIsMasked: 0.0,
    uMaskBoundsY: 1.25,
  },
  `
    uniform float uDistortion; uniform float uScale;
    varying vec2 vUv; varying vec3 vWorldPos;
    void main() {
      vUv = uv; vec3 pos = position; pos.xy *= uScale;
      pos.z += sin(uv.x * 3.1415) * sin(uv.y * 3.1415) * uDistortion * 2.0; 
      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  `
    uniform sampler2D uTexture; uniform float uDistortion; uniform float uIsMasked; uniform float uMaskBoundsY;
    varying vec2 vUv; varying vec3 vWorldPos;
    void main() {
      if (uIsMasked > 0.5 && abs(vWorldPos.y) > uMaskBoundsY) { discard; }
      vec2 uv = vUv; uv.x += sin(uv.y * 10.0) * uDistortion * 0.03;
      gl_FragColor = texture2D(uTexture, uv);
    }
  `,
);
extend({ FogSliderMaterial });

const images = Array.from(
  { length: 14 },
  (_, i) => `/assets/images/image_${String(i + 1).padStart(3, "0")}.webp`,
);

export default function UnifiedScene() {
  const { activeLayout, setActiveLayout, setActiveProject } = useStore();
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const textures = useTexture(images);

  const targetX = useRef(0),
    currentX = useRef(0),
    velocity = useRef(0);
  const targetGridY = useRef(0),
    currentGridY = useRef(0),
    velocityGridY = useRef(0);

  const rawScrollIndex = useRef(0);
  const lastScrollTime = useRef(Date.now());

  const sliderWidth = viewport.width * 0.32;
  const sliderHeight = viewport.height * 0.65;
  const margin = viewport.width * 0.05;
  const spacingY4 = sliderHeight * 1.5;

  const layout1Positions = useMemo(
    () =>
      images.map(() => ({
        x: (Math.random() - 0.5) * viewport.width * 0.85,
        y: (Math.random() - 0.5) * viewport.height * 0.65,
        z: Math.random() * -3 - 1,
        scale: Math.random() * 0.2 + 0.2,
      })),
    [viewport],
  );

  const layout2Positions = useMemo(
    () =>
      images.map((_, i) => ({
        x: viewport.width * 0.2 + (i % 2) * (sliderWidth * 0.6),
        rowOffset: Math.floor(i / 2) * (sliderHeight * 0.6),
        z: 0,
        scale: 0.5,
      })),
    [viewport, sliderWidth, sliderHeight],
  );

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();

      if (activeLayout === "layout-4-lens") {
        if (now - lastScrollTime.current > 750) {
          if (e.deltaY > 15) {
            rawScrollIndex.current += 1;
            lastScrollTime.current = now;
          } else if (e.deltaY < -15) {
            rawScrollIndex.current -= 1;
            lastScrollTime.current = now;
          }

          const safeIndex =
            ((rawScrollIndex.current % images.length) + images.length) %
            images.length;
          setActiveProject(safeIndex);
          targetGridY.current = rawScrollIndex.current * spacingY4;
        }
        return;
      }

      if (activeLayout === "layout-3-gallery")
        targetX.current -= (e.deltaX + e.deltaY) * 0.08;
      else if (activeLayout === "layout-2-gallery")
        targetGridY.current -= e.deltaY * 0.08;
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeLayout, spacingY4, setActiveProject, images.length]);

  useFrame(() => {
    if (!groupRef.current) return;

    if (activeLayout === "layout-4-lens")
      targetGridY.current = rawScrollIndex.current * spacingY4;

    currentX.current = THREE.MathUtils.lerp(
      currentX.current,
      targetX.current,
      0.08,
    );
    velocity.current = THREE.MathUtils.lerp(
      velocity.current,
      THREE.MathUtils.clamp((targetX.current - currentX.current) * 0.01, -2, 2),
      0.1,
    );
    currentGridY.current = THREE.MathUtils.lerp(
      currentGridY.current,
      targetGridY.current,
      0.08,
    );
    velocityGridY.current = THREE.MathUtils.lerp(
      velocityGridY.current,
      THREE.MathUtils.clamp(
        (targetGridY.current - currentGridY.current) * 0.01,
        -2,
        2,
      ),
      0.1,
    );

    const totalWidth = (sliderWidth + margin) * images.length;
    const totalHeight2 = Math.ceil(images.length / 2) * (sliderHeight * 0.6);
    const totalHeight4 = images.length * spacingY4;

    groupRef.current.children.forEach((mesh: any, i) => {
      let data =
        activeLayout === "layout-4-lens"
          ? LayoutEngines.getLayout4(
              i,
              currentGridY.current,
              spacingY4,
              totalHeight4,
            )
          : activeLayout === "layout-1-gallery"
            ? LayoutEngines.getLayout1(i, layout1Positions)
            : activeLayout === "layout-2-gallery"
              ? LayoutEngines.getLayout2(
                  i,
                  currentGridY.current,
                  layout2Positions,
                  totalHeight2,
                  velocityGridY.current,
                )
              : LayoutEngines.getLayout3(
                  i,
                  currentX.current,
                  sliderWidth,
                  margin,
                  totalWidth,
                  velocity.current,
                );

      if (
        activeLayout === "layout-3-gallery" &&
        Math.abs(data.x - mesh.position.x) > totalWidth * 0.5
      )
        mesh.position.x += data.x > mesh.position.x ? totalWidth : -totalWidth;
      if (
        activeLayout === "layout-2-gallery" &&
        Math.abs(data.y - mesh.position.y) > totalHeight2 * 0.5
      )
        mesh.position.y +=
          data.y > mesh.position.y ? totalHeight2 : -totalHeight2;
      if (
        activeLayout === "layout-4-lens" &&
        Math.abs(data.y - mesh.position.y) > totalHeight4 * 0.5
      )
        mesh.position.y +=
          data.y > mesh.position.y ? totalHeight4 : -totalHeight4;

      mesh.position.lerp(new THREE.Vector3(data.x, data.y, data.z), 0.06);
      mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, data.rotX, 0.05);
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, data.rotY, 0.05);

      if (mesh.material) {
        mesh.material.uDistortion = THREE.MathUtils.lerp(
          mesh.material.uDistortion,
          velocity.current,
          0.05,
        );
        mesh.scale.setScalar(
          THREE.MathUtils.lerp(mesh.scale.x, data.scale, 0.05),
        );
        mesh.material.uIsMasked = THREE.MathUtils.lerp(
          mesh.material.uIsMasked,
          data.isMasked,
          0.1,
        );

        // Exact viewport Y-clipping (20% from center equals 40vh)
        mesh.material.uMaskBoundsY = viewport.height * 0.2;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {textures.map((tex, i) => (
        <mesh
          key={i}
          onClick={() => {
            if (activeLayout !== "layout-4-lens") {
              rawScrollIndex.current = i;
              setActiveProject(i);
              currentGridY.current = i * spacingY4;
              targetGridY.current = i * spacingY4;
              setActiveLayout("layout-4-lens");
            }
          }}
        >
          <planeGeometry args={[sliderWidth, sliderHeight, 64, 64]} />
          {/* @ts-ignore */}
          <fogSliderMaterial uTexture={tex} />
        </mesh>
      ))}
    </group>
  );
}
