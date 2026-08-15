'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { TextureLoader, RepeatWrapping } from 'three';
import type { Texture } from 'three';
import type { CatalogItem } from '@/types/catalog';
import { getCategoryGarmentTransform } from '@/lib/garment-alignment';

interface GarmentLayersProps {
  wornItems: Record<string, CatalogItem>;
  heightScale: number;
}

/** GLB from fal Rodin / catalog modelUrl */
function GarmentGLB({
  url,
  item,
  scale: heightScale,
}: {
  url: string;
  item: CatalogItem;
  scale: number;
}) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(), [scene]);
  const { position, scale: meshScale } = getCategoryGarmentTransform(item.category, heightScale);

  return (
    <group position={position} scale={meshScale}>
      <primitive object={clone} />
    </group>
  );
}

/** Single garment mesh: GLB if modelUrl, else procedural + texture */
function GarmentMesh({
  item,
  slot,
  scale,
}: {
  item: CatalogItem;
  slot: string;
  scale: number;
}) {
  if (item.modelUrl) {
    return (
      <Suspense fallback={null}>
        <GarmentGLB key={item.modelUrl} url={item.modelUrl} item={item} scale={scale} />
      </Suspense>
    );
  }

  return <GarmentProceduralMesh item={item} scale={scale} />;
}

function GarmentProceduralMesh({
  item,
  scale,
}: {
  item: CatalogItem;
  scale: number;
}) {
  const [texture, setTexture] = useState<Texture | null>(null);
  const [texError, setTexError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loader = new TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      item.imageUrl,
      (t) => {
        if (!cancelled) {
          t.wrapS = t.wrapT = RepeatWrapping;
          setTexture(t);
        }
      },
      undefined,
      () => {
        if (!cancelled) setTexError(true);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [item.imageUrl]);

  const s = scale;
  const color = texError || !texture ? getCategoryColor(item.category) : '#fff';

  if (item.category === 'dress') {
    return (
      <group position={[0, 0.85 * s, 0]}>
        <mesh position={[0, 0.25 * s, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22 * s, 0.35 * s, 0.5 * s, 24]} />
          <meshStandardMaterial
            map={texture ?? undefined}
            color={color}
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
        <mesh position={[0, 0.55 * s, 0]} castShadow>
          <cylinderGeometry args={[0.2 * s, 0.22 * s, 0.2 * s, 24]} />
          <meshStandardMaterial
            map={texture ?? undefined}
            color={color}
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
      </group>
    );
  }

  if (item.category === 'top' || item.category === 'outerwear') {
    const thickness = item.category === 'outerwear' ? 0.24 : 0.2;
    return (
      <mesh position={[0, 1.1 * s, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.38 * s, 0.5 * s, thickness * s]} />
        <meshStandardMaterial
          map={texture ?? undefined}
          color={color}
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>
    );
  }

  if (item.category === 'bottom') {
    return (
      <group position={[0, 0.35 * s, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.14 * s, 0.18 * s, 0.55 * s, 24]} />
          <meshStandardMaterial
            map={texture ?? undefined}
            color={color}
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
      </group>
    );
  }

  return (
    <mesh position={[0, 0.1 * s, 0.12 * s]} castShadow>
      <boxGeometry args={[0.1 * s, 0.05 * s, 0.2 * s]} />
      <meshStandardMaterial
        map={texture ?? undefined}
        color={color}
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    dress: '#7c3aed',
    top: '#2563eb',
    bottom: '#1e3a5f',
    outerwear: '#374151',
    shoes: '#1f2937',
    accessory: '#6b7280',
    'full-body': '#4b5563',
  };
  return colors[category] ?? '#6b7280';
}

export function GarmentLayers({ wornItems, heightScale }: GarmentLayersProps) {
  const entries = Object.entries(wornItems);
  if (entries.length === 0) return null;

  return (
    <group position={[0, 0, 0]}>
      {entries.map(([slot, item]) => (
        <Suspense key={`${slot}-${item.id}`} fallback={null}>
          <GarmentMesh item={item} slot={slot} scale={heightScale} />
        </Suspense>
      ))}
    </group>
  );
}
