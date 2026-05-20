import { motion } from "framer-motion";

/**
 * WaterProgressRing — Animated SVG liquid-fill progress ring.
 */
export default function WaterProgressRing({
  percentage = 0,
  amount = 0,
  goal = 3,
}) {
  const SIZE = 220;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const RADIUS = 90;

  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  // حساب مستوى الماية الرأسي
  const waterY = CY + RADIUS - (clampedPct / 100) * (RADIUS * 2);

  // الألوان بناءً على الإنجاز
  const color =
    clampedPct >= 100 ? "#10b981" : clampedPct >= 75 ? "#f59e0b" : "#60a5fa";

  const glowColor =
    clampedPct >= 100 ? "rgba(16,185,129,0.3)" : "rgba(96,165,250,0.3)";

  // رسمة موجة ثابتة ومكررة أفقياً عشان تتحرك بسلاسة وبدون نهاية
  const wavePath = `
    M 0 10
    Q 45 20, 90 10
    T 180 10
    T 270 10
    T 360 10
    V 240
    H 0
    Z
  `;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ filter: `drop-shadow(0 0 16px ${glowColor})` }}
      >
        <defs>
          {/* ماسك الدائرة لقشط الماية زيادة ونقصان */}
          <clipPath id="liquid-clip">
            <circle cx={CX} cy={CY} r={RADIUS - 4} />
          </clipPath>
          {/* تأثير توهج الحدود */}
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
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={3}
        />

        {/* ── Liquid fill (Clipped & GPU Accelerated) ───────────── */}
        <g clipPath="url(#liquid-clip)">
          {/* مستطيل الخلفية الشفاف للماية */}
          <motion.rect
            x={CX - RADIUS}
            y={waterY}
            width={RADIUS * 2}
            height={RADIUS * 2 + 20}
            fill={`${color}15`}
            animate={{ y: waterY }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* تجميعة الأمواج في جروب يتحرك رأسياً مع النسبة */}
          <motion.g
            animate={{ y: waterY - 10 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* الموجة الأولى: تتحرك أفقياً بالكامل على الـ GPU */}
            <motion.path
              d={wavePath}
              fill={`${color}44`}
              style={{ willChange: "transform" }}
              animate={{ x: [-180, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* الموجة الثانية: عكس الاتجاه وبارتفاع مختلف لعمق سينمائي */}
            <motion.path
              d={wavePath}
              fill={`${color}22`}
              style={{ willChange: "transform" }}
              animate={{ x: [0, -180] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.g>
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
          style={{
            transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease",
          }}
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* ── Center text ────────────────────────────────────────── */}
        <text
          x={CX}
          y={CY - 14}
          textAnchor="middle"
          fill="white"
          fontSize="36"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
          style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.25))" }}
        >
          {(amount / 1000).toFixed(1)}
        </text>
        <text
          x={CX}
          y={CY + 10}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="14"
          fontFamily="Inter, sans-serif"
        >
          of {goal}L goal
        </text>
        <text
          x={CX}
          y={CY + 34}
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
          animate={{ scale: [0, 1.2, 1], opacity: 1 }}
          className="absolute -top-2 -right-2 text-2xl"
        >
          🎉
        </motion.div>
      )}
    </div>
  );
}
