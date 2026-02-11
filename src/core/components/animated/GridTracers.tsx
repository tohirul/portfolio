// GridTracers.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type RefObject,
} from "react";

/* =============================
   1. CONFIG & TYPES
   ============================= */

const GRID_SIZE = 30;
const STROKE_WIDTH = 0.2;
const TRAIL_LENGTH = 80;
const SPEED = 100;

// How long a segment stays "hot" (blocked) after the head passes
// Formula: (Trail Length / Speed) + Safety Buffer
const TRAIL_DURATION = (TRAIL_LENGTH / SPEED) * 1000 + 500;

const COLORS = ["var(--color-brand-neon)", "#ffffff", "#09aa"];

type Point = { x: number; y: number };

interface TracerConfig {
  path: string;
  length: number;
  collided: boolean;
  endX: number;
  endY: number;
  duration: number;
  delay: number;
  key: number;
}

interface TracerAgentProps {
  screenWidth: number;
  screenHeight: number;
  color: string;
  index: number;
  gridRegistry: RefObject<Map<string, [number, number][]>>;
  onCollapse: (x: number, y: number, color: string) => void;
}

/* =============================
   2. MAIN COMPONENT
   ============================= */

export function GridTracers() {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [explosions, setExplosion] = useState<
    { id: number; x: number; y: number; color: string }[]
  >([]);

  // REGISTRY:
  // Key: "x,y" coordinate string
  // Value: Array of [StartTimestamp, EndTimestamp] intervals
  const gridRegistry = useRef<Map<string, [number, number][]>>(new Map());

  // Helper to trigger visual explosions
  const triggerExplosion = useCallback(
    (x: number, y: number, color: string) => {
      const id = Math.random();
      setExplosion((prev) => [...prev, { id, x, y, color }]);

      // Use window.setTimeout (standard browser API)
      window.setTimeout(() => {
        setExplosion((prev) => prev.filter((e) => e.id !== id));
      }, 800);
    },
    [],
  );

  useEffect(() => {
    const handleResize = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);

    // Clear registry on mount/resize to prevent stale collision data
    gridRegistry.current.clear();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!size) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-plus-lighter"
      style={{
        maskImage:
          "radial-gradient(ellipse 60% 60% at 50% 10%, #000 60%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 60% 60% at 50% 10%, #000 60%, transparent 100%)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.w} ${size.h}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="z-10"
      >
        <defs>
          <filter id="pixel-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Array.from({ length: 25 }).map((_, i) => (
          <TracerAgent
            key={i}
            screenWidth={size.w}
            screenHeight={size.h}
            color={COLORS[i % COLORS.length]}
            index={i}
            gridRegistry={gridRegistry}
            onCollapse={triggerExplosion}
          />
        ))}
      </svg>

      <div className="absolute inset-0 z-20">
        <AnimatePresence>
          {explosions.map((ex) => (
            <ParticleBurst key={ex.id} x={ex.x} y={ex.y} color={ex.color} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =============================
   3. THE AGENT
   ============================= */

function TracerAgent({
  screenWidth,
  screenHeight,
  color,
  index,
  gridRegistry,
  onCollapse,
}: TracerAgentProps) {
  const [config, setConfig] = useState<TracerConfig | null>(null);

  const regenerate = useCallback(() => {
    const now = Date.now();
    let startX = 0;
    let startY = 0;
    let attempts = 0;

    // 1. SAFE SPAWN (Top 40%)
    do {
      startX = snap(Math.random() * screenWidth);
      startY = snap(Math.random() * (screenHeight * 0.4));
      attempts++;
    } while (
      // Check if spawn point is busy RIGHT NOW
      checkCollision(startX, startY, now, now + 200, gridRegistry.current!) &&
      attempts < 10
    );

    // 2. Generate Path
    const result = generateGraphPath(
      { x: startX, y: startY },
      screenWidth,
      screenHeight,
      gridRegistry.current!,
    );

    return {
      path: result.d,
      length: result.length,
      collided: result.collided,
      endX: result.endX,
      endY: result.endY,
      duration: result.length / SPEED,
      delay: Math.random() * 2,
      key: Math.random(),
    };
  }, [screenWidth, screenHeight, gridRegistry]);

  useEffect(() => {
    const timer = window.setTimeout(() => setConfig(regenerate()), index * 200);
    return () => window.clearTimeout(timer);
  }, [regenerate, index]);

  if (!config) return null;

  return (
    <motion.path
      key={config.key}
      d={config.path}
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="square"
      filter="url(#pixel-glow)"
      fill="none"
      initial={{
        strokeDasharray: `${TRAIL_LENGTH} ${config.length}`,
        strokeDashoffset: config.length + TRAIL_LENGTH,
        opacity: 0,
      }}
      animate={{
        strokeDashoffset: -TRAIL_LENGTH,
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        strokeDashoffset: { duration: config.duration, ease: "linear" },
        opacity: {
          duration: config.duration,
          times: [0, 0.05, 0.9, 1],
          ease: "linear",
        },
      }}
      onAnimationComplete={() => {
        if (config.collided) {
          onCollapse(config.endX, config.endY, color);
        }
        window.setTimeout(
          () => setConfig(regenerate()),
          Math.random() * 1500 + 500,
        );
      }}
    />
  );
}

/* =============================
   4. PARTICLE BURST
   ============================= */

function ParticleBurst({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: string;
}) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      <motion.div
        initial={{ scale: 0, opacity: 1, borderWidth: 2 }}
        animate={{ scale: 2.5, opacity: 0, borderWidth: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white box-border"
        style={{ width: 20, height: 20, borderColor: color }}
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: Math.cos((angle * Math.PI) / 180) * 35,
            y: Math.sin((angle * Math.PI) / 180) * 35,
            scale: 0,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute w-0.5 h-0.5 bg-white rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

/* =============================
   5. GRAPH ALGORITHMS
   ============================= */

const snap = (val: number) => Math.floor(val / GRID_SIZE) * GRID_SIZE;

// Helper: Check if a time interval overlaps with existing reservations
function checkCollision(
  x: number,
  y: number,
  startT: number,
  endT: number,
  registry: Map<string, [number, number][]>,
) {
  const key = `${x},${y}`;
  const intervals = registry.get(key);

  if (!intervals || !Array.isArray(intervals)) return false;

  // Check overlap with ANY existing interval
  for (const [s, e] of intervals) {
    if (startT < e && endT > s) return true;
  }
  return false;
}

// Helper: Add reservation
function addReservation(
  x: number,
  y: number,
  startT: number,
  endT: number,
  registry: Map<string, [number, number][]>,
) {
  const key = `${x},${y}`;

  // CRITICAL FIX: Ensure we start with a clean array if data is corrupt
  let intervals = registry.get(key);
  if (!intervals || !Array.isArray(intervals)) {
    intervals = [];
  }

  intervals.push([startT, endT]);

  // Cleanup old intervals to prevent memory leak
  if (intervals.length > 20) intervals.shift();

  registry.set(key, intervals);
}

function generateGraphPath(
  start: Point,
  w: number,
  h: number,
  registry: Map<string, [number, number][]>,
) {
  let path = `M ${start.x} ${start.y}`;
  const current = { ...start };
  let length = 0;
  let dir = Math.random() > 0.4 ? { x: 0, y: 1 } : { x: 1, y: 0 };
  let collided = false;

  const now = Date.now();
  let steps = 0;
  const MAX_STEPS = 40;

  while (steps < MAX_STEPS && current.y < h && current.x > 0 && current.x < w) {
    // 1. Determine Run Length
    const runLength =
      dir.x !== 0
        ? Math.floor(Math.random() * 5) + 2
        : Math.floor(Math.random() * 3) + 2;

    // 2. Walk the path block by block
    let actualDist = 0;

    for (let i = 1; i <= runLength; i++) {
      const nextX = current.x + dir.x * (i * GRID_SIZE);
      const nextY = current.y + dir.y * (i * GRID_SIZE);

      // Calculate Precise Arrival Time
      const distanceSoFar = length + i * GRID_SIZE;
      const arrivalTime = now + (distanceSoFar / SPEED) * 1000;

      // This cell is occupied from [Arrival] to [Arrival + TrailDuration]
      const departureTime = arrivalTime + TRAIL_DURATION;

      // Check Collision with Graph
      if (checkCollision(nextX, nextY, arrivalTime, departureTime, registry)) {
        collided = true;
        break;
      }

      // Reserve it
      addReservation(nextX, nextY, arrivalTime, departureTime, registry);
      actualDist += GRID_SIZE;
    }

    current.x += dir.x * actualDist;
    current.y += dir.y * actualDist;
    path += ` L ${current.x} ${current.y}`;
    length += actualDist;
    steps++;

    if (collided) break;

    // Change Dir
    if (dir.x !== 0) dir = { x: 0, y: 1 };
    else dir = { x: Math.random() > 0.5 ? 1 : -1, y: 0 };
  }

  return { d: path, length, endX: current.x, endY: current.y, collided };
}
