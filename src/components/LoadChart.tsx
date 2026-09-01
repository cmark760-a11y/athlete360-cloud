import { useState } from "react";

export interface LoadChartPoint {
  weekLabel: string;
  totalMinutes: number;
  sessionCount: number;
  avgRpe: number | null;
}

interface LoadChartProps {
  data: LoadChartPoint[];
}

const WIDTH = 640;
const HEIGHT = 220;
const PADDING_LEFT = 40;
const PADDING_BOTTOM = 28;
const PADDING_TOP = 16;
const BAR_MAX_WIDTH = 24;

function niceMax(value: number) {
  if (value <= 0) return 60;
  const step = value <= 120 ? 30 : value <= 300 ? 60 : 120;
  return Math.ceil(value / step) * step;
}

export default function LoadChart({ data }: LoadChartProps) {
  const [hovered, setHovered] = useState<{ index: number; x: number; y: number } | null>(null);

  const plotWidth = WIDTH - PADDING_LEFT - 12;
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const max = niceMax(Math.max(...data.map((d) => d.totalMinutes), 0));
  const slot = plotWidth / data.length;
  const barWidth = Math.min(BAR_MAX_WIDTH, slot - 8);
  const ticks = [0, max / 2, max];

  return (
    <div className="chart-wrap">
      <svg className="load-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Weekly training load in minutes">
        {ticks.map((t) => {
          const y = PADDING_TOP + plotHeight - (t / max) * plotHeight;
          return (
            <g key={t}>
              <line className="gridline" x1={PADDING_LEFT} x2={WIDTH - 8} y1={y} y2={y} />
              <text className="axis-label" x={PADDING_LEFT - 8} y={y + 4} textAnchor="end">
                {Math.round(t)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const barHeight = max > 0 ? (d.totalMinutes / max) * plotHeight : 0;
          const x = PADDING_LEFT + i * slot + (slot - barWidth) / 2;
          const y = PADDING_TOP + plotHeight - barHeight;
          const isLast = i === data.length - 1;
          return (
            <g
              key={d.weekLabel}
              onMouseEnter={() => setHovered({ index: i, x: x + barWidth / 2, y })}
              onMouseLeave={() => setHovered((h) => (h?.index === i ? null : h))}
            >
              <rect
                className="bar-track"
                x={x - 4}
                y={PADDING_TOP}
                width={barWidth + 8}
                height={plotHeight}
              />
              <rect
                className="bar"
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, d.totalMinutes > 0 ? 2 : 0)}
                rx={4}
                opacity={hovered && hovered.index !== i ? 0.55 : 1}
              />
              {isLast && d.totalMinutes > 0 && (
                <text className="value-label" x={x + barWidth / 2} y={y - 8} textAnchor="middle">
                  {d.totalMinutes}m
                </text>
              )}
              <text
                className="axis-label"
                x={x + barWidth / 2}
                y={HEIGHT - PADDING_BOTTOM + 16}
                textAnchor="middle"
              >
                {d.weekLabel}
              </text>
            </g>
          );
        })}
      </svg>
      {hovered && data[hovered.index] && (
        <div
          className="chart-tooltip"
          style={{
            left: `${(hovered.x / WIDTH) * 100}%`,
            top: `${(hovered.y / HEIGHT) * 100}%`,
          }}
        >
          <strong>{data[hovered.index].totalMinutes} min</strong>
          <span>
            {data[hovered.index].sessionCount} session{data[hovered.index].sessionCount === 1 ? "" : "s"}
            {data[hovered.index].avgRpe !== null ? ` · avg RPE ${data[hovered.index].avgRpe}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
