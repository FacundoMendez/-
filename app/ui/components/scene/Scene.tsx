"use client";
import "@react-three/fiber";
import { useRef, useEffect, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree, extend, type ThreeElements } from "@react-three/fiber";
import { useGLTF, useAnimations, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader.js";

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// Smoke shader material
const SmokeShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0.6, 0.6, 0.7),
    uOpacity: 0.35,
    uSpeed: 0.3,
    uScale: 1.5,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader with FBM noise for realistic smoke
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uSpeed;
    uniform float uScale;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Simplex 3D noise
    vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod(i, 289.0);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
      float n_ = 1.0/7.0;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    // FBM (Fractal Brownian Motion) for more realistic smoke
    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for(int i = 0; i < 5; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      
      return value;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Create flowing smoke effect
      float time = uTime * uSpeed;
      
      // Multiple layers of noise for depth
      vec3 noiseCoord1 = vec3(uv * uScale, time * 0.5);
      vec3 noiseCoord2 = vec3(uv * uScale * 2.0 + 100.0, time * 0.3);
      vec3 noiseCoord3 = vec3(uv * uScale * 0.5 + 50.0, time * 0.7);
      
      float noise1 = fbm(noiseCoord1);
      float noise2 = fbm(noiseCoord2) * 0.5;
      float noise3 = fbm(noiseCoord3) * 0.25;
      
      float combinedNoise = (noise1 + noise2 + noise3) * 0.5 + 0.5;
      
      // Edge fade for smooth blending
      float edgeFade = smoothstep(0.0, 0.3, uv.x) * smoothstep(1.0, 0.7, uv.x);
      edgeFade *= smoothstep(0.0, 0.4, uv.y) * smoothstep(1.0, 0.5, uv.y);
      
      // Swirl effect
      float swirl = sin(uv.x * 3.14159 + time) * 0.1;
      combinedNoise += swirl;
      
      // Final alpha with pulsing
      float pulse = sin(time * 2.0) * 0.1 + 0.9;
      float alpha = combinedNoise * edgeFade * uOpacity * pulse;
      
      // Dynamic color variation - shifts between gray, purple, blue, pink
      float colorShift = sin(time * 0.4) * 0.5 + 0.5;
      float colorShift2 = cos(time * 0.25 + 1.0) * 0.5 + 0.5;
      float colorShift3 = sin(time * 0.15 + 2.0) * 0.5 + 0.5;
      
      vec3 color1 = uColor;
      vec3 colorGray = vec3(0.55, 0.55, 0.6); // Gray
      vec3 colorGray2 = vec3(0.45, 0.45, 0.5); // Darker gray
      vec3 colorPurple = vec3(0.5, 0.35, 0.7); // Purple
      vec3 colorBlue = vec3(0.4, 0.45, 0.75); // Blue
      vec3 colorPink = vec3(0.6, 0.4, 0.6); // Pink
      
      // Mix with gray as base
      vec3 mixedColor = mix(colorGray, color1, colorShift * 0.6);
      mixedColor = mix(mixedColor, colorGray2, noise1 * 0.4);
      mixedColor = mix(mixedColor, colorPurple, colorShift2 * noise2 * 0.5);
      mixedColor = mix(mixedColor, colorBlue, colorShift3 * 0.3);
      mixedColor = mix(mixedColor, colorPink, sin(time * 0.5 + uv.x * 2.0) * 0.2 + 0.1);
      
      // Subtle shimmer effect
      float shimmer = sin(time * 2.0 + uv.y * 8.0) * 0.08 + 0.92;
      mixedColor *= shimmer;
      
      gl_FragColor = vec4(mixedColor, alpha * 0.9);
    }
  `
);

extend({ SmokeShaderMaterial });

// Animated smoke layer component with smooth fade in/out and slow movement
function AnimatedSmokeLayer({ 
  initialPosition, 
  rotation, 
  scale, 
  speed, 
  baseOpacity,
  color,
  delay,
  duration,
  riseSpeed,
  driftSpeed,
}: { 
  initialPosition: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  speed: number;
  baseOpacity: number;
  color: string;
  delay: number;
  duration: number;
  riseSpeed: number;
  driftSpeed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  useFrame(({ clock }) => {
    if (!materialRef.current || !meshRef.current) return;
    
    const elapsed = clock.getElapsedTime();
    materialRef.current.uniforms.uTime.value = elapsed;
    
    // Calculate cycle progress with delay offset
    const cycleElapsed = Math.max(0, elapsed - delay);
    const pauseDuration = 15; // Long pause between smoke bursts
    const totalCycleDuration = duration + pauseDuration;
    const cycleProgress = (cycleElapsed % totalCycleDuration) / duration;
    
    // Very smooth fade using longer transition periods (40% fade in, 20% full, 40% fade out)
    let fadeProgress = 0;
    if (cycleProgress < 0.4) {
      // Slow fade in (40% of duration)
      fadeProgress = cycleProgress / 0.4;
    } else if (cycleProgress < 0.6) {
      // Full opacity (20% of duration)
      fadeProgress = 1;
    } else if (cycleProgress < 1.0) {
      // Slow fade out (40% of duration)
      fadeProgress = (1 - cycleProgress) / 0.4;
    } else {
      // Pause period - invisible
      fadeProgress = 0;
    }
    
    // Ultra smooth easing (quintic ease in-out)
    const t = fadeProgress;
    const easedFade = t < 0.5 
      ? 16 * t * t * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 5) / 2;
    
    materialRef.current.uniforms.uOpacity.value = baseOpacity * easedFade;
    
    // Rise movement (smoke goes up smoothly)
    const riseOffset = (cycleProgress * duration * riseSpeed * 0.5) % 18;
    
    // Flowing horizontal drift
    const driftX = Math.sin(elapsed * driftSpeed * 0.4 + delay) * 5;
    const driftZ = Math.cos(elapsed * driftSpeed * 0.3 + delay) * 4;
    
    // Update position with smooth interpolation
    meshRef.current.position.set(
      initialPosition[0] + driftX,
      initialPosition[1] + riseOffset,
      initialPosition[2] + driftZ
    );
    
    // Gentle rotation animation
    meshRef.current.rotation.z = Math.sin(elapsed * 0.25 + delay) * 0.08;
    meshRef.current.rotation.x = rotation[0] + Math.cos(elapsed * 0.15 + delay) * 0.03;
    
    // Scale breathing effect
    const scalePulse = 1 + Math.sin(elapsed * 0.3 + delay) * 0.12;
    meshRef.current.scale.setScalar(scalePulse);
  });

  return (
    <mesh ref={meshRef} position={initialPosition} rotation={rotation}>
      <planeGeometry args={[scale[0], scale[1], 32, 32]} />
      {/* @ts-ignore */}
      <smokeShaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        uColor={new THREE.Color(color)}
        uOpacity={0}
        uSpeed={speed}
        uScale={1.5}
      />
    </mesh>
  );
}

// Party smoke effect with animated layers
function PartySmoke() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Animate the entire smoke group slowly
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.15;
      groupRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.1) * 2;
    }
  });

  const smokeLayers = useMemo(() => [
    // Wave 1 - Gray smoke burst (starts immediately)
    { initialPosition: [-15, -12, 5] as [number, number, number], rotation: [0, 0.1, 0] as [number, number, number], scale: [40, 25, 1] as [number, number, number], speed: 0.18, baseOpacity: 0.55, color: "#888899", delay: 0, duration: 10, riseSpeed: 0.8, driftSpeed: 0.4 },
    { initialPosition: [15, -12, 6] as [number, number, number], rotation: [0, -0.1, 0] as [number, number, number], scale: [45, 28, 1] as [number, number, number], speed: 0.16, baseOpacity: 0.5, color: "#777788", delay: 2, duration: 11, riseSpeed: 0.7, driftSpeed: 0.35 },
    { initialPosition: [0, -14, 4] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [50, 30, 1] as [number, number, number], speed: 0.2, baseOpacity: 0.6, color: "#999999", delay: 4, duration: 9, riseSpeed: 0.9, driftSpeed: 0.45 },
    
    // === PAUSE - No smoke for ~8 seconds ===
    
    // Wave 2 - Purple/blue mix (after pause)
    { initialPosition: [-20, -8, 8] as [number, number, number], rotation: [-0.2, 0.2, 0] as [number, number, number], scale: [35, 22, 1] as [number, number, number], speed: 0.22, baseOpacity: 0.45, color: "#7766aa", delay: 18, duration: 12, riseSpeed: 0.6, driftSpeed: 0.5 },
    { initialPosition: [20, -8, 9] as [number, number, number], rotation: [-0.2, -0.2, 0] as [number, number, number], scale: [38, 24, 1] as [number, number, number], speed: 0.2, baseOpacity: 0.42, color: "#8877bb", delay: 20, duration: 13, riseSpeed: 0.55, driftSpeed: 0.45 },
    { initialPosition: [0, -10, 7] as [number, number, number], rotation: [-0.15, 0, 0] as [number, number, number], scale: [55, 32, 1] as [number, number, number], speed: 0.24, baseOpacity: 0.48, color: "#6655aa", delay: 22, duration: 11, riseSpeed: 0.7, driftSpeed: 0.4 },
    
    // === PAUSE - No smoke for ~10 seconds ===
    
    // Wave 3 - Gray wisps (after long pause)
    { initialPosition: [-10, -5, 12] as [number, number, number], rotation: [-0.4, 0.15, 0.1] as [number, number, number], scale: [30, 18, 1] as [number, number, number], speed: 0.28, baseOpacity: 0.38, color: "#aaaaaa", delay: 40, duration: 14, riseSpeed: 0.5, driftSpeed: 0.55 },
    { initialPosition: [10, -5, 11] as [number, number, number], rotation: [-0.35, -0.15, -0.1] as [number, number, number], scale: [32, 20, 1] as [number, number, number], speed: 0.26, baseOpacity: 0.35, color: "#999999", delay: 42, duration: 15, riseSpeed: 0.45, driftSpeed: 0.5 },
    
    // === PAUSE - No smoke for ~6 seconds ===
    
    // Wave 4 - Mixed gray and color burst
    { initialPosition: [-25, -15, 3] as [number, number, number], rotation: [0.1, 0.3, 0.1] as [number, number, number], scale: [28, 20, 1] as [number, number, number], speed: 0.22, baseOpacity: 0.52, color: "#8888aa", delay: 62, duration: 11, riseSpeed: 0.85, driftSpeed: 0.38 },
    { initialPosition: [25, -15, 3] as [number, number, number], rotation: [0.1, -0.3, -0.1] as [number, number, number], scale: [30, 22, 1] as [number, number, number], speed: 0.2, baseOpacity: 0.48, color: "#777799", delay: 64, duration: 12, riseSpeed: 0.8, driftSpeed: 0.4 },
    { initialPosition: [0, -12, 5] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [45, 28, 1] as [number, number, number], speed: 0.18, baseOpacity: 0.55, color: "#9999bb", delay: 66, duration: 10, riseSpeed: 0.75, driftSpeed: 0.42 },
  ], []);

  return (
    <group ref={groupRef}>
      {smokeLayers.map((layer, index) => (
        <AnimatedSmokeLayer key={index} {...layer} />
      ))}
    </group>
  );
}

interface Props {
  scene_hero: React.MutableRefObject<HTMLElement | null>;
}

// Alien model component
function AlienModel() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/assets/model/alien.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions && animations.length > 1) {
      const action1 = actions[animations[1]?.name];
      if (action1) {
        action1.setEffectiveTimeScale(0.7);
        action1.play();
      }
    }

    if (actions && animations.length > 2) {
      const action2 = actions[animations[2]?.name];
      if (action2) {
        action2.setEffectiveTimeScale(0.25);
        action2.play();
      }
    }
  }, [actions, animations]);

  return (
    <group ref={group}>
      <primitive object={scene} scale={7.5} />
    </group>
  );
}

// Post-processing effects using Three.js EffectComposer
function Effects({
  isHolding,
  periodicGlitch,
}: {
  isHolding: boolean;
  periodicGlitch: boolean;
}) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  const glitchPassRef = useRef<GlitchPass | null>(null);

  // Setup composer once
  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.setSize(size.width, size.height);
    
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms["offset"].value = 0.5;
    vignettePass.uniforms["darkness"].value = 0.8;
    composer.addPass(vignettePass);

    const glitchPass = new GlitchPass();
    glitchPass.enabled = false;
    composer.addPass(glitchPass);

    composerRef.current = composer;
    glitchPassRef.current = glitchPass;

    return () => {
      composer.dispose();
    };
  }, [gl, scene, camera, size.width, size.height]);

  // Update glitch state
  useEffect(() => {
    if (glitchPassRef.current) {
      const shouldGlitch = isHolding || periodicGlitch;
      glitchPassRef.current.enabled = shouldGlitch;
      glitchPassRef.current.goWild = isHolding;
    }
  }, [isHolding, periodicGlitch]);

  // Render with composer instead of default renderer
  useFrame((_state, _delta) => {
    if (composerRef.current) {
      gl.autoClear = false;
      gl.clear();
      composerRef.current.render();
    }
  }, 1);

  return null;
}

// Main scene content
function SceneContent({
  isHolding,
  periodicGlitch,
}: {
  isHolding: boolean;
  periodicGlitch: boolean;
}) {
  return (
    <>
      {/* Lights */}
      <directionalLight position={[0, 0, 40]} intensity={1.5} />
      <ambientLight intensity={1.3} />

      {/* Fog */}
      <fog attach="fog" args={[0x000000, 0.1, 120]} />

      {/* Model with Suspense */}
      <Suspense fallback={null}>
        <AlienModel />
      </Suspense>

      {/* Party smoke effect */}
      <PartySmoke />

      {/* Post-processing effects */}
      <Effects isHolding={isHolding} periodicGlitch={periodicGlitch} />
    </>
  );
}

const Scene = ({ scene_hero }: Props) => {
  const [isHolding, setIsHolding] = useState(false);
  const [periodicGlitch, setPeriodicGlitch] = useState(false);

  // Periodic glitch effect every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPeriodicGlitch(true);
      setTimeout(() => setPeriodicGlitch(false), 200);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Hold effect handlers
  useEffect(() => {
    const element = scene_hero.current;
    if (!element) return;

    const handleDown = () => setIsHolding(true);
    const handleUp = () => setIsHolding(false);

    element.addEventListener("mousedown", handleDown);
    element.addEventListener("mouseup", handleUp);
    element.addEventListener("mouseleave", handleUp);
    element.addEventListener("touchstart", handleDown, { passive: true });
    element.addEventListener("touchend", handleUp, { passive: true });

    return () => {
      element.removeEventListener("mousedown", handleDown);
      element.removeEventListener("mouseup", handleUp);
      element.removeEventListener("mouseleave", handleUp);
      element.removeEventListener("touchstart", handleDown);
      element.removeEventListener("touchend", handleUp);
    };
  }, [scene_hero]);

  return (
    <Canvas
      className="canvas rounded-[40px] md:rounded-[70px]"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "99vw",
        height: "98vh",
        zIndex: 2,
      }}
      camera={{ position: [0, 0, 24], fov: 75, near: 0.1, far: 100 }}
      gl={{
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        alpha: true,
        depth: true,
      }}
      dpr={[1, 1.5]}
      frameloop="always"
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <SceneContent isHolding={isHolding} periodicGlitch={periodicGlitch} />
    </Canvas>
  );
};

// Preload model
useGLTF.preload("/assets/model/alien.glb");

export default Scene;
