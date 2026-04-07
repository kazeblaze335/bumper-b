"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";

const FragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    
    // Slow, heavy liquid distortion
    float noise1 = snoise(uv * 1.5 + uTime * 0.08);
    float noise2 = snoise(uv * 2.5 - uTime * 0.12 + noise1);
    
    // Moody palette (Deep Blacks to Zinc)
    vec3 color1 = vec3(0.02, 0.02, 0.03); 
    vec3 color2 = vec3(0.1, 0.1, 0.12); 
    
    vec3 finalColor = mix(color1, color2, noise2 + 0.5);
    
    // Strong vignette to blend the edges into the background gradient
    float vignette = smoothstep(1.5, 0.1, length(uv - 0.5));
    finalColor *= vignette;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const VertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FluidScene = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <>
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[viewport.width, viewport.height, 32, 32]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={VertexShader}
          fragmentShader={FragmentShader}
          uniforms={uniforms}
          transparent={true}
        />
      </mesh>

      <Float
        speed={2}
        rotationIntensity={0.2}
        floatIntensity={0.5}
        floatingRange={[-0.1, 0.1]}
      >
        <Text
          position={[0, 0, 0]}
          fontSize={viewport.width * 0.15}
          letterSpacing={-0.05}
          font="/fonts/PPNeueMontreal-Bold.otf"
          color="#ffffff"
          fillOpacity={0.02} // Ghostly, barely-there glassy fill
          // =======================================================
          // THE FIX: Outline Properties
          // Outline width is calculated as a percentage of fontSize!
          // =======================================================
          outlineWidth={0.012}
          outlineColor="rgba(255, 255, 255, 0.25)"
          anchorX="center"
          anchorY="middle"
        >
          SOJU
          {/* Explicitly tell the renderer this text is transparent so it doesn't block the fluid */}
          <meshBasicMaterial toneMapped={false} transparent={true} />
        </Text>
      </Float>
    </>
  );
};

export default function FluidWatermark() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-zinc-950 opacity-80 mix-blend-multiply dark:mix-blend-normal">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <FluidScene />
      </Canvas>
    </div>
  );
}
