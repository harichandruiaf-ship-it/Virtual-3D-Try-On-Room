'use client';

import { useGLTF } from '@react-three/drei';

interface GLBAvatarProps {
  url: string;
  scale?: number;
}

export function GLBAvatar({ url, scale = 1 }: GLBAvatarProps) {
  const { scene } = useGLTF(url);
  const clone = scene.clone();
  return (
    <group scale={scale} position={[0, 0, 0]}>
      <primitive object={clone} />
    </group>
  );
}
