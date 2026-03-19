'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Ring } from '@react-three/drei';
import * as THREE from 'three';

function SpinningRings({ isThinking }: { isThinking: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const speed = isThinking ? 4 : 1;
      groupRef.current.rotation.x += delta * speed * 0.5;
      groupRef.current.rotation.y += delta * speed * 0.3;
      groupRef.current.rotation.z += delta * speed * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Ring args={[0.8, 1, 32]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={isThinking ? 'var(--plasma)' : 'var(--volt)'} wireframe />
      </Ring>
      <Ring args={[0.6, 0.8, 32]} rotation={[0, Math.PI / 2, 0]}>
        <meshBasicMaterial color={isThinking ? 'var(--nova)' : 'var(--ion)'} wireframe />
      </Ring>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="var(--chalk)" wireframe={!isThinking} />
      </mesh>
    </group>
  );
}

export function OrbitWidget({ isThinking = false }: { isThinking?: boolean }) {
  return (
    <div className="w-16 h-16 inline-block">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <SpinningRings isThinking={isThinking} />
      </Canvas>
    </div>
  );
}
