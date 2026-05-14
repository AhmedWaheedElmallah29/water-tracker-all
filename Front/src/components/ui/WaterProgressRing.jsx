import { motion } from "framer-motion";

/**
 * WaterProgressRing — Animated SVG liquid-fill progress ring.
 *
 * Shows a circular ring with an animated water wave inside that fills
 * up proportionally to the current hydration percentage.
 *
 * @param {number} percentage - 0 to 100
 * @param {number} amount     - current amount in ml
 * @param {number} goal       - daily goal in Liters
 */
export default function WaterProgressRing({ percentage = 0, amount = 0, goal = 3 }) {
  const SIZE = 220;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const RADIUS = 90;

  // Water level Y position inside the clipped circle
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const waterY = CY + RADIUS - (clampedPct / 100) * (RADIUS * 2);

  // Color based on progress
  const color =
    clampedPct >= 100
      ? "#10b981" // green — complete
      : clampedPct >= 75
      ? "#f59e0b" // amber — almost there
      : "#60a5fa"; // blue — keep going

  const glowColor =
    clampedPct >= 100 ? "rgba(16,185,129,0.4)" : "rgba(96,165,250,0.4)";

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ filter: `drop-shadow(0 0 20px ${glowColor})` }}
      >
        <defs>
          {/* Circular clip mask for the liquid fill */}
          <clipPath id="liquid-clip">
            <circle cx={CX} cy={CY} r={RADIUS - 4} />
          </clipPath>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Outer track circle ─────────────────────────────────── */}
        <circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={3}
        />

        {/* ── Liquid fill (clipped to circle) ───────────────────── */}
        <g clipPath="url(#liquid-clip)">
          {/* Static fill rectangle — fills from waterY downward */}
          <motion.rect
            x={CX - RADIUS}
            y={waterY}
            width={RADIUS * 2}
            height={RADIUS * 2 + 20}
            fill={`${color}26`}
            animate={{ y: waterY }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Wave 1 — primary animated wave */}
          <motion.path
            fill={`${color}55`}
            animate={{
              d: [
                `M${CX - RADIUS},${waterY}
                 Q${CX - RADIUS / 2},${waterY - 10} ${CX},${waterY}
                 Q${CX + RADIUS / 2},${waterY + 10} ${CX + RADIUS},${waterY}
                 L${CX + RADIUS},${CY + RADIUS + 10}
                 L${CX - RADIUS},${CY + RADIUS + 10} Z`,
                `M${CX - RADIUS},${waterY}
                 Q${CX - RADIUS / 2},${waterY + 10} ${CX},${waterY}
                 Q${CX + RADIUS / 2},${waterY - 10} ${CX + RADIUS},${waterY}
                 L${CX + RADIUS},${CY + RADIUS + 10}
                 L${CX - RADIUS},${CY + RADIUS + 10} Z`,
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Wave 2 — offset wave for layered depth */}
          <motion.path
            fill={`${color}33`}
            animate={{
              d: [
                `M${CX - RADIUS},${waterY + 5}
                 Q${CX - RADIUS / 2},${waterY - 5} ${CX},${waterY + 5}
                 Q${CX + RADIUS / 2},${waterY + 15} ${CX + RADIUS},${waterY + 5}
                 L${CX + RADIUS},${CY + RADIUS + 10}
                 L${CX - RADIUS},${CY + RADIUS + 10} Z`,
                `M${CX - RADIUS},${waterY + 5}
                 Q${CX - RADIUS / 2},${waterY + 15} ${CX},${waterY + 5}
                 Q${CX + RADIUS / 2},${waterY - 5} ${CX + RADIUS},${waterY + 5}
                 L${CX + RADIUS},${CY + RADIUS + 10}
                 L${CX - RADIUS},${CY + RADIUS + 10} Z`,
              ],
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
        </g>

        {/* ── Progress arc border ────────────────────────────────── */}
        <circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={`${2 * Math.PI * RADIUS}`}
          strokeDashoffset={`${2 * Math.PI * RADIUS * (1 - clampedPct / 100)}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.5s ease" }}
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* ── Center text ────────────────────────────────────────── */}
        <text
          x={CX}
          y={CY - 16}
          textAnchor="middle"
          fill="white"
          fontSize="36"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))" }}
        >
          {(amount / 1000).toFixed(1)}
        </text>
        <text
          x={CX}
          y={CY + 8}
          textAnchor="middle"
          fill="rgba(255,255,255,0.6)"
          fontSize="14"
          fontFamily="Inter, sans-serif"
        >
          of {goal}L goal
        </text>
        <text
          x={CX}
          y={CY + 32}
          textAnchor="middle"
          fill={color}
          fontSize="16"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          {Math.round(clampedPct)}%
        </text>
      </svg>

      {/* Completion sparkle */}
      {clampedPct >= 100 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: 1 }}
          className="absolute -top-2 -right-2 text-2xl"
        >
          🎉
        </motion.div>
      )}
    </div>
  );
}
