import React, { useRef, useState } from 'react';
import { Engine } from '../core/Engine';
import { SurfaceHit, WorkbenchMode } from '../types';

interface Props {
  engine: Engine | null;
  currentMode: WorkbenchMode;
  onSurfacePoint: (hit: SurfaceHit) => void;
  onDrawPoint?: (hit: SurfaceHit) => void;
  onDrawFinish?: () => void;
}

export const SceneInputLayer: React.FC<Props> = ({ engine, currentMode, onSurfacePoint, onDrawPoint, onDrawFinish }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const getHit = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!engine || !rootRef.current) return null;
    const rect = rootRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return engine.surfaceQuery.raycastPointer({ x, y } as any, engine.camera);
  };
  const pointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    setDrawing(true);
    const hit = getHit(event);
    if (!hit) return;
    if (currentMode === 'freehand_drawing') onDrawPoint?.(hit);
    else onSurfacePoint(hit);
  };
  const pointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (currentMode !== 'freehand_drawing' || !drawing || !onDrawPoint) return;
    const hit = getHit(event);
    if (hit) onDrawPoint(hit);
  };
  const pointerUp = () => {
    setDrawing(false);
    if (currentMode === 'freehand_drawing') onDrawFinish?.();
  };
  return <div ref={rootRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} className="absolute inset-0 cursor-crosshair" />;
};
