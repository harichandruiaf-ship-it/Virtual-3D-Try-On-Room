'use client';

import type { VirtualHumanModel } from '@/types/body';

export function ModelSummary({ model }: { model: VirtualHumanModel }) {
  const { measurements, face } = model;
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <span className="text-room-muted">
        Height: <strong className="text-white">{measurements.height} cm</strong>
      </span>
      <span className="text-room-muted">
        Chest: <strong className="text-white">{measurements.chest} cm</strong>
      </span>
      <span className="text-room-muted">
        Waist: <strong className="text-white">{measurements.waist} cm</strong>
      </span>
      <span className="text-room-muted">
        Hips: <strong className="text-white">{measurements.hips} cm</strong>
      </span>
      <span className="text-room-muted">
        Face: <strong className="text-white">{face.shape}</strong>
      </span>
    </div>
  );
}
