'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Wireframe, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="var(--volt)" wireframe />
        {/* We use Drei's Wireframe for a thicker, stylized look if needed, but basic mesh wireframe is fine for pure brutalism */}
        <Box args={[1.9, 1.9, 1.9]}>
          <meshBasicMaterial color="var(--ink)" />
        </Box>
      </mesh>
    </Float>
  );
}

export function Scene3D() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AnimatedCube />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
