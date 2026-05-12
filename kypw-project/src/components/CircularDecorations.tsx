"use client";

import { motion } from "framer-motion";

/* ────────────────────────────────────────────────
   ConcentricCircles - 3-4 teal rings rotating
   at different speeds as a decorative accent
   ──────────────────────────────────────────────── */
interface ConcentricCirclesProps {
  className?: string;
  size?: number;
  color?: string;
}

function ConcentricCircles({
  className = "",
  size = 300,
  color = "#4E8EA2",
}: ConcentricCirclesProps) {
  const rings = [1, 0.75, 0.5, 0.3];
  const speeds = [60, 45, 30, 20]; // seconds per rotation

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {rings.map((scale, i) => {
        const r = (size / 2) * scale;
        const cx = size / 2;
        const cy = size / 2;
        return (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            stroke={color}
            strokeWidth={1.2}
            opacity={0.15 + i * 0.06}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: speeds[i],
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}
    </svg>
  );
}

/* ────────────────────────────────────────────────
   FloatingRings - 5 overlapping rings at various
   angles that gently float up / down
   ──────────────────────────────────────────────── */
interface FloatingRingsProps {
  className?: string;
  color?: string;
}

function FloatingRings({ className = "", color = "#4E8EA2" }: FloatingRingsProps) {
  const rings = [
    { size: 120, x: 0, y: 0, delay: 0, duration: 5 },
    { size: 80, x: 60, y: -40, delay: 0.5, duration: 6 },
    { size: 160, x: -40, y: 30, delay: 1.0, duration: 7 },
    { size: 50, x: 100, y: 20, delay: 1.5, duration: 4.5 },
    { size: 100, x: -20, y: -60, delay: 2.0, duration: 5.5 },
  ];

  return (
    <div className={`absolute inset-0 ${className}`}>
      {rings.map((ring, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: ring.x, top: ring.y }}
          animate={{ y: [0, -12, 0] }}
          transition={{
            duration: ring.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: ring.delay,
          }}
        >
          <svg
            width={ring.size}
            height={ring.size}
            viewBox={`0 0 ${ring.size} ${ring.size}`}
            fill="none"
          >
            <motion.circle
              cx={ring.size / 2}
              cy={ring.size / 2}
              r={ring.size / 2 - 2}
              stroke={color}
              strokeWidth={1}
              opacity={0.15 + i * 0.04}
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 30 + i * 10,
                repeat: Infinity,
                ease: "linear",
                delay: ring.delay,
              }}
              style={{
                transformOrigin: `${ring.size / 2}px ${ring.size / 2}px`,
              }}
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────
   WaterRipple - pulsing ring that expands & fades
   ──────────────────────────────────────────────── */
interface WaterRippleProps {
  className?: string;
  color?: string;
  maxRadius?: number;
}

function WaterRipple({
  className = "",
  color = "#4E8EA2",
  maxRadius = 120,
}: WaterRippleProps) {
  const rippleCount = 3;

  return (
    <div className={`absolute inset-0 flex items-center justify-center ${className}`}>
      {Array.from({ length: rippleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          animate={{
            scale: [0.3, 1],
            opacity: [0.3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 1,
          }}
        >
          <svg
            width={maxRadius * 2}
            height={maxRadius * 2}
            viewBox={`0 0 ${maxRadius * 2} ${maxRadius * 2}`}
            fill="none"
          >
            <circle
              cx={maxRadius}
              cy={maxRadius}
              r={maxRadius}
              stroke={color}
              strokeWidth={1.5}
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────
   CircleCluster - group of small circles drifting
   slowly for a parallax-like effect
   ──────────────────────────────────────────────── */
interface CircleClusterProps {
  className?: string;
  color?: string;
}

function CircleCluster({ className = "", color = "#6EA2B3" }: CircleClusterProps) {
  const circles = [
    { size: 16, x: 10, y: 20, delay: 0, duration: 8 },
    { size: 10, x: 50, y: 10, delay: 1.2, duration: 7 },
    { size: 22, x: 80, y: 40, delay: 0.6, duration: 9 },
    { size: 8, x: 30, y: 60, delay: 2, duration: 6.5 },
    { size: 14, x: 65, y: 70, delay: 1.5, duration: 8.5 },
    { size: 6, x: 15, y: 80, delay: 2.5, duration: 7.5 },
    { size: 18, x: 90, y: 15, delay: 0.3, duration: 10 },
    { size: 12, x: 45, y: 85, delay: 1.8, duration: 7.2 },
  ];

  return (
    <div className={`absolute inset-0 ${className}`}>
      {circles.map((c, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
          animate={{
            x: [0, 8, -4, 0],
            y: [0, -10, 5, 0],
          }}
          transition={{
            duration: c.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: c.delay,
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: c.size,
              height: c.size,
              backgroundColor: color,
              opacity: 0.12 + (i % 3) * 0.06,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────
   Main export - full-page decorative overlay
   composed from all sub-components above
   ──────────────────────────────────────────────── */
export function CircularDecorations() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Top-left concentric accent */}
      <motion.div
        className="absolute -top-32 -left-32 opacity-40 md:opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ConcentricCircles size={280} color="#4E8EA2" />
      </motion.div>

      {/* Bottom-right concentric accent */}
      <motion.div
        className="absolute -bottom-24 -right-24 opacity-30 md:opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <ConcentricCircles size={220} color="#6EA2B3" />
      </motion.div>

      {/* Top-right floating rings cluster */}
      <div className="absolute -top-10 right-[10%] hidden md:block">
        <FloatingRings color="#4E8EA2" />
      </div>

      {/* Bottom-left circle cluster */}
      <div className="absolute bottom-[15%] -left-10 hidden md:block">
        <CircleCluster color="#6EA2B3" />
      </div>

      {/* Right edge accent - small concentric */}
      <motion.div
        className="absolute top-[40%] -right-16 opacity-20 hidden lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <ConcentricCircles size={160} color="#49769F" />
      </motion.div>
    </div>
  );
}

/* Individual exports for targeted placement */
export { ConcentricCircles, FloatingRings, WaterRipple, CircleCluster };
