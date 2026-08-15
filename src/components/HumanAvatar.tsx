'use client';

/**
 * Parametric humanoid when no GLB is available (fallback)
 */
export function HumanAvatar({
  scale = 1,
  wireframe = false,
}: {
  scale?: number;
  wireframe?: boolean;
}) {
  const s = scale;
  const skin = { color: '#e8c4a0', roughness: 0.7, metalness: 0.05 };
  const skinLimbs = { color: '#c49a6c', roughness: 0.75, metalness: 0 };
  const skinLegs = { color: '#8b7355', roughness: 0.8, metalness: 0 };

  return (
    <group scale={s}>
      <mesh position={[0, 1.62, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial {...skin} wireframe={wireframe} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 0.45, 0.2]} />
        <meshStandardMaterial {...skinLimbs} wireframe={wireframe} />
      </mesh>
      <mesh position={[-0.42, 1.2, 0]} castShadow>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial {...skinLimbs} wireframe={wireframe} />
      </mesh>
      <mesh position={[0.42, 1.2, 0]} castShadow>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial {...skinLimbs} wireframe={wireframe} />
      </mesh>
      <mesh position={[-0.1, 0.35, 0]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial {...skinLegs} wireframe={wireframe} />
      </mesh>
      <mesh position={[0.1, 0.35, 0]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial {...skinLegs} wireframe={wireframe} />
      </mesh>
    </group>
  );
}
