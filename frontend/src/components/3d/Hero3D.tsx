'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Abstract trophy/orb component
function FloatingOrb({ color = '#b20e38' }: { color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

// Particles background
function Particles({ count = 200 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const particlesPosition = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    particlesPosition[i * 3] = (Math.random() - 0.5) * 20;
    particlesPosition[i * 3 + 1] = (Math.random() - 0.5) * 20;
    particlesPosition[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.02;
    points.current.rotation.x = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
          args={[particlesPosition, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Ring component
function GlowingRing({ radius = 3, color = '#b20e38' }: { radius?: number; color?: string }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    ringRef.current.rotation.z = state.clock.elapsedTime * 0.2;
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.05, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

// Main Hero 3D Scene
interface Hero3DSceneProps {
  className?: string;
  primaryColor?: string;
}

export function Hero3DScene({ className = '', primaryColor = '#b20e38' }: Hero3DSceneProps) {
  return (
    <div className={`canvas-container ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color={primaryColor} />
          <spotLight
            position={[0, 10, 0]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            color={primaryColor}
          />
          
          <FloatingOrb color={primaryColor} />
          <GlowingRing radius={3.5} color={primaryColor} />
          <GlowingRing radius={4} color="#ffe5cd" />
          <Particles count={150} />
          
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Sport-specific 3D element
interface SportOrb3DProps {
  color: string;
  className?: string;
}

export function SportOrb3D({ color, className = '' }: SportOrb3DProps) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1} color={color} />
          
          <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
            <Sphere args={[1, 32, 32]} scale={1.5}>
              <MeshDistortMaterial
                color={color}
                attach="material"
                distort={0.3}
                speed={1.5}
                roughness={0.3}
                metalness={0.7}
              />
            </Sphere>
          </Float>
          
          <Particles count={50} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Loading fallback component
export function Scene3DFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse-glow" />
    </div>
  );
}
