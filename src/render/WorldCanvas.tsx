import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import type { GridPosition } from '../game/state/types';
import styles from './WorldCanvas.module.css';
import { setupCanvas } from './canvasSetup';
import { LOGICAL_H, LOGICAL_W } from './constants';
import { drawWorld } from './drawWorld';
import type { WorldSnapshot } from './types';
import { pixelToGridCell } from './viewModel';

interface WorldCanvasProps {
  snapshot: WorldSnapshot;
  onCellHover?: (cell: GridPosition) => void;
  onCellLeave?: () => void;
  onCellClick?: (cell: GridPosition) => void;
}

export function WorldCanvas({ snapshot, onCellHover, onCellLeave, onCellClick }: WorldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const snapshotRef = useRef(snapshot);
  const startRef = useRef(0);
  const frameRef = useRef(0);

  snapshotRef.current = snapshot;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = setupCanvas(canvas);
    startRef.current = performance.now();

    const resizeObserver = new ResizeObserver(() => {
      if (canvasRef.current) ctxRef.current = setupCanvas(canvasRef.current);
    });
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    const loop = (now: number) => {
      const ctx = ctxRef.current;
      if (ctx) drawWorld(ctx, snapshotRef.current, now - startRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  function toGridCell(event: ReactPointerEvent<HTMLCanvasElement>): GridPosition {
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = LOGICAL_W / rect.width;
    const scaleY = LOGICAL_H / rect.height;
    const px = (event.clientX - rect.left) * scaleX;
    const py = (event.clientY - rect.top) * scaleY;
    return pixelToGridCell(px, py);
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      onPointerMove={(event) => onCellHover?.(toGridCell(event))}
      onPointerLeave={() => onCellLeave?.()}
      onPointerDown={(event) => onCellClick?.(toGridCell(event))}
    />
  );
}
