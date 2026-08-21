'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { CANVAS_SIZE } from '@/lib/constants';

const CELL_SIZE = 10;
const CANVAS_DIM = CANVAS_SIZE * CELL_SIZE;
const LOCAL_STORAGE_KEY = 'stellarcanvas-canvas';
const GRID_COLOR = 'rgba(255,255,255,0.08)';
const HOVER_COLOR = 'rgba(255,255,255,0.2)';
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 20;

export type Grid = (string | null)[][];

export interface PixelCanvasHandle {
  setCell: (x: number, y: number, color: string) => void;
}

function createEmptyGrid(): Grid {
  return Array.from({ length: CANVAS_SIZE }, () =>
    Array.from({ length: CANVAS_SIZE }, () => null),
  );
}

function loadGrid(): Grid {
  if (typeof window === 'undefined') return createEmptyGrid();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return createEmptyGrid();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== CANVAS_SIZE)
      return createEmptyGrid();
    for (let y = 0; y < CANVAS_SIZE; y++) {
      if (!Array.isArray(parsed[y]) || parsed[y].length !== CANVAS_SIZE)
        return createEmptyGrid();
    }
    return parsed as Grid;
  } catch {
    return createEmptyGrid();
  }
}

function saveGrid(grid: Grid) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(grid));
  } catch {
    /* storage full */
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  hoverCell: { x: number; y: number } | null,
) {
  ctx.clearRect(0, 0, CANVAS_DIM, CANVAS_DIM);

  for (let y = 0; y < CANVAS_SIZE; y++) {
    for (let x = 0; x < CANVAS_SIZE; x++) {
      const color = grid[y][x];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  for (let i = 0; i <= CANVAS_SIZE; i++) {
    ctx.fillStyle = GRID_COLOR;
    ctx.fillRect(i * CELL_SIZE, 0, 1, CANVAS_DIM);
    ctx.fillRect(0, i * CELL_SIZE, CANVAS_DIM, 1);
  }

  if (hoverCell) {
    ctx.fillStyle = HOVER_COLOR;
    ctx.fillRect(
      hoverCell.x * CELL_SIZE,
      hoverCell.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE,
    );
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      hoverCell.x * CELL_SIZE + 0.5,
      hoverCell.y * CELL_SIZE + 0.5,
      CELL_SIZE - 1,
      CELL_SIZE - 1,
    );
  }
}

interface PixelCanvasProps {
  selectedColor: string;
  onPaintCell: (x: number, y: number, color: string) => void;
  disabled?: boolean;
}

export const PixelCanvas = forwardRef<PixelCanvasHandle, PixelCanvasProps>(
  function PixelCanvas({ selectedColor, onPaintCell, disabled = false }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<Grid>(loadGrid());
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const zoomRef = useRef(zoom);
    const panRef = useRef(pan);
    const isPanning = useRef(false);
    const lastScreen = useRef({ x: 0, y: 0 });
    const isPainting = useRef(false);
    const hoverRef = useRef<{ x: number; y: number } | null>(null);

    zoomRef.current = zoom;
    panRef.current = pan;

    const redraw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      drawGrid(ctx, gridRef.current, hoverRef.current);
    }, []);

    const setCell = useCallback(
      (x: number, y: number, color: string) => {
        if (x < 0 || x >= CANVAS_SIZE || y < 0 || y >= CANVAS_SIZE) return;
        if (gridRef.current[y][x] === color) return;
        gridRef.current[y] = [...gridRef.current[y]];
        gridRef.current[y][x] = color;
        saveGrid(gridRef.current);
        redraw();
      },
      [redraw],
    );

    useImperativeHandle(ref, () => ({ setCell }), [setCell]);

    useEffect(() => {
      redraw();
    }, [redraw]);

    const screenToCanvas = useCallback(
      (sx: number, sy: number): { x: number; y: number } | null => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return null;
        const rect = wrapper.getBoundingClientRect();
        const x = (sx - rect.left - panRef.current.x) / zoomRef.current;
        const y = (sy - rect.top - panRef.current.y) / zoomRef.current;
        const cx = Math.floor(x / CELL_SIZE);
        const cy = Math.floor(y / CELL_SIZE);
        if (cx < 0 || cx >= CANVAS_SIZE || cy < 0 || cy >= CANVAS_SIZE)
          return null;
        return { x: cx, y: cy };
      },
      [],
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
          e.preventDefault();
          isPanning.current = true;
          lastScreen.current = { x: e.clientX, y: e.clientY };
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          return;
        }

        if (e.button === 0 && !disabled) {
          const cell = screenToCanvas(e.clientX, e.clientY);
          if (cell) {
            isPainting.current = true;
            onPaintCell(cell.x, cell.y, selectedColor);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }
        }
      },
      [screenToCanvas, onPaintCell, selectedColor, disabled],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (isPanning.current) {
          const dx = e.clientX - lastScreen.current.x;
          const dy = e.clientY - lastScreen.current.y;
          lastScreen.current = { x: e.clientX, y: e.clientY };
          setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
          return;
        }

        const cell = screenToCanvas(e.clientX, e.clientY);

        if (isPainting.current && cell && !disabled) {
          onPaintCell(cell.x, cell.y, selectedColor);
        }

        const same =
          hoverRef.current &&
          cell &&
          hoverRef.current.x === cell.x &&
          hoverRef.current.y === cell.y;
        if (!same) {
          hoverRef.current = cell;
          redraw();
        }
      },
      [screenToCanvas, onPaintCell, selectedColor, disabled, redraw],
    );

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
      isPanning.current = false;
      isPainting.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }, []);

    const handlePointerLeave = useCallback(() => {
      hoverRef.current = null;
      redraw();
      isPainting.current = false;
    }, [redraw]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
      e.preventDefault();
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const oldZoom = zoomRef.current;

      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom + delta));
      const ratio = newZoom / oldZoom;

      setPan((prev) => ({
        x: mouseX - ratio * (mouseX - prev.x),
        y: mouseY - ratio * (mouseY - prev.y),
      }));
      setZoom(newZoom);
    }, []);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
    }, []);

    return (
      <div className="flex flex-col items-center gap-3">
        <div
          ref={wrapperRef}
          className="overflow-hidden rounded-xl border border-white/10 bg-black/40 ring-1 ring-white/5"
          role="img"
          aria-label="64 by 64 pixel canvas. Click to paint. Scroll to zoom. Ctrl+click to pan."
          style={{
            width: CANVAS_DIM,
            height: CANVAS_DIM,
            touchAction: 'none',
            opacity: disabled ? 0.5 : 1,
            contain: 'paint layout',
            cursor: disabled ? 'default' : 'crosshair',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onWheel={handleWheel}
          onContextMenu={handleContextMenu}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_DIM}
            height={CANVAS_DIM}
            className="block"
            aria-hidden="true"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              imageRendering: 'pixelated',
            }}
          />
        </div>

        <p className="text-muted-foreground text-center text-xs">
          Click to paint • Scroll to zoom •{' '}
          {typeof window !== 'undefined' &&
          window.navigator.platform.includes('Mac')
            ? '⌘'
            : 'Ctrl'}
          +Click to pan
        </p>
      </div>
    );
  },
);
