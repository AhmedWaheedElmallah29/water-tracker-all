import { motion } from "framer-motion";

/**
 * WeeklyChart — Inline SVG bar chart for the last 7 days of water intake.
 * No external chart library needed.
 *
 * @param {Array} history - Array of water entry objects from the API
 *   Each entry: { date, amount, goal }
 */
export default function WeeklyChart({ history = [] }) {
  const CHART_W = 320;
  const CHART_H = 120;
  const BAR_COUNT = 7;
  const BAR_GAP = 8;
  const BAR_W = (CHART_W - BAR_GAP * (BAR_COUNT + 1)) / BAR_COUNT;

  // Build a 7-day array ending today
  const days = Array.from({ length: BAR_COUNT }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (BAR_COUNT - 1 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  // Match history entries to each day slot
  const barsData = days.map((day) => {
    const entry = history.find((h) => {
      const hDate = new Date(h.date);
      hDate.setHours(0, 0, 0, 0);
      return hDate.getTime() === day.getTime();
    });

    const amount = entry?.amount || 0;
    const goal = (entry?.goal || 3) * 1000;
    const pct = Math.min(amount / goal, 1);
    const goalMet = amount >= goal && goal > 0;

    return {
      day: day.getDay(),
      amount,
      pct,
      goalMet,
      label: dayLabels[day.getDay()],
      isToday: day.getTime() === (() => { const t = new Date(); t.setHours(0,0,0,0); return t.getTime(); })(),
    };
  });

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H + 28}`}
        className="w-full max-w-sm mx-auto"
      >
        {/* Background grid lines */}
        {[0.25, 0.5, 0.75, 1].map((pct) => (
          <line
            key={pct}
            x1={0}
            y1={CHART_H - CHART_H * pct}
            x2={CHART_W}
            y2={CHART_H - CHART_H * pct}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}

        {/* Goal line (100%) */}
        <line
          x1={0} y1={0} x2={CHART_W} y2={0}
          stroke="rgba(96,165,250,0.3)"
          strokeWidth={1}
          strokeDasharray="6 3"
        />

        {/* Bars */}
        {barsData.map((bar, i) => {
          const x = BAR_GAP + i * (BAR_W + BAR_GAP);
          const barH = bar.pct * CHART_H;
          const y = CHART_H - barH;
          const color = bar.goalMet ? "#10b981" : bar.isToday ? "#60a5fa" : "#3b82f6";
          const glowColor = bar.goalMet
            ? "rgba(16,185,129,0.5)"
            : "rgba(96,165,250,0.4)";

          return (
            <g key={i}>
              {/* Bar background */}
              <rect
                x={x}
                y={0}
                width={BAR_W}
                height={CHART_H}
                rx={6}
                fill="rgba(255,255,255,0.04)"
              />
              {/* Animated bar fill */}
              <motion.rect
                x={x}
                width={BAR_W}
                rx={6}
                fill={color}
                fillOpacity={bar.isToday ? 1 : 0.8}
                initial={{ y: CHART_H, height: 0 }}
                animate={{ y, height: Math.max(barH, 3) }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: "easeOut" }}
                style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
              />
              {/* Goal met star */}
              {bar.goalMet && (
                <text
                  x={x + BAR_W / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize="10"
                >
                  ⭐
                </text>
              )}
              {/* Today indicator dot */}
              {bar.isToday && (
                <circle
                  cx={x + BAR_W / 2}
                  cy={CHART_H + 16}
                  r={3}
                  fill="#60a5fa"
                />
              )}
              {/* Day label */}
              <text
                x={x + BAR_W / 2}
                y={CHART_H + 24}
                textAnchor="middle"
                fill={bar.isToday ? "#60a5fa" : "rgba(255,255,255,0.4)"}
                fontSize="11"
                fontWeight={bar.isToday ? "700" : "400"}
                fontFamily="Inter, sans-serif"
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-400" />
          <span className="text-white/40 text-xs">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <span className="text-white/40 text-xs">Goal Met ⭐</span>
        </div>
      </div>
    </div>
  );
}
