'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { HumanAvatar } from './HumanAvatar';
import { GLBAvatar } from './GLBAvatar';
import { GarmentLayers } from './GarmentLayers';
import type { CatalogItem } from '@/types/catalog';

interface SceneProps {
  meshUrl?: string | null;
  heightScale?: number;
  wireframe?: boolean;
  wornItems?: Record<string, CatalogItem>;
}

function FallbackAvatar({ heightScale = 1 }: { heightScale?: number }) {
  return (
    <Suspense fallback={null}>
      <HumanAvatar scale={heightScale} />
    </Suspense>
  );
}

export function Scene({
  meshUrl,
  heightScale = 1,
  wireframe = false,
  wornItems = {},
}: SceneProps) {
  return (
    <div className="canvas-container w-full h-full">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.2, 2.5], fov: 45 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0f0f12']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 8, 4]} intensity={1.2} castShadow />
        <directionalLight position={[-2, 4, -2]} intensity={0.4} />
        <PerspectiveCamera makeDefault position={[0, 1.2, 2.5]} fov={45} />
        <OrbitControls
          enablePan
          enableZoom
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2 - 0.1}
          target={[0, 1, 0]}
        />
        <Suspense fallback={<FallbackAvatar heightScale={heightScale} />}>
          {meshUrl ? (
            <GLBAvatar url={meshUrl} scale={1} />
          ) : (
            <HumanAvatar scale={heightScale} wireframe={wireframe} />
          )}
        </Suspense>
        <GarmentLayers wornItems={wornItems} heightScale={heightScale} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
