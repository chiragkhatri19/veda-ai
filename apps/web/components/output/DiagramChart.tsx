import type { DiagramData } from '@veda/shared';

const W = 420;
const H = 210;
const P = { t: 20, r: 24, b: 46, l: 54 };
const IW = W - P.l - P.r;
const IH = H - P.t - P.b;

function toY(val: number, max: number): number {
  if (max === 0) return P.t + IH / 2;
  return P.t + IH - (val / max) * IH;
}

function toX(i: number, n: number): number {
  return n <= 1 ? P.l + IW / 2 : P.l + (i / (n - 1)) * IW;
}

export default function DiagramChart({ diagramData: d }: { diagramData: DiagramData }) {
  if (!d.data?.length) return null;

  const maxRaw = Math.max(...d.data.map((p) => p.value));
  const maxY = maxRaw === 0 ? 1 : maxRaw * 1.2;

  const TICKS = 4;
  const tickVals = Array.from({ length: TICKS + 1 }, (_, i) => (maxY / TICKS) * (TICKS - i));

  const n = d.data.length;
  const barStep = IW / n;
  const barW = Math.max(8, Math.min(34, barStep * 0.55));

  const linePoints = d.data
    .map((p, i) => `${toX(i, n)},${toY(p.value, maxY)}`)
    .join(' ');

  return (
    <div className="w-full">
      {d.title && (
        <p className="text-center text-[11px] font-semibold text-app-text-secondary mb-1.5 font-serif">
          {d.title}
        </p>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="diagram-svg w-full max-w-[420px] mx-auto block"
        aria-label={d.title ?? 'Diagram'}
      >
        {/* Grid lines */}
        {tickVals.map((tv, i) => {
          const gy = toY(tv, maxY);
          return (
            <g key={i}>
              {i < TICKS && (
                <line
                  x1={P.l} y1={gy} x2={P.l + IW} y2={gy}
                  stroke="rgb(var(--c-border))" strokeWidth="0.6" strokeDasharray="3 3"
                  className="chart-grid"
                />
              )}
              <text
                x={P.l - 5} y={gy + 3.5}
                textAnchor="end" fontSize={8}
                fill="rgb(var(--c-text3))"
              >
                {Number.isInteger(tv) ? tv : tv.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Axes */}
        <line
          x1={P.l} y1={P.t} x2={P.l} y2={P.t + IH + 1}
          stroke="rgb(var(--c-text2))" strokeWidth="1.5"
          className="chart-axis"
        />
        <line
          x1={P.l - 1} y1={P.t + IH} x2={P.l + IW} y2={P.t + IH}
          stroke="rgb(var(--c-text2))" strokeWidth="1.5"
          className="chart-axis"
        />

        {/* Y-axis label */}
        {d.yLabel && (
          <text
            x={11} y={P.t + IH / 2}
            textAnchor="middle" fontSize={8.5}
            fill="rgb(var(--c-text3))"
            transform={`rotate(-90 11 ${P.t + IH / 2})`}
          >
            {d.yLabel}
          </text>
        )}

        {/* X-axis label */}
        {d.xLabel && (
          <text
            x={P.l + IW / 2} y={H - 3}
            textAnchor="middle" fontSize={8.5}
            fill="rgb(var(--c-text3))"
          >
            {d.xLabel}
          </text>
        )}

        {/* Line chart */}
        {d.type === 'line' && (
          <>
            <polyline
              points={linePoints}
              fill="none"
              stroke="rgb(var(--c-orange))" strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round"
            />
            {d.data.map((p, i) => (
              <circle
                key={i}
                cx={toX(i, n)} cy={toY(p.value, maxY)}
                r="3" fill="rgb(var(--c-orange))"
              />
            ))}
          </>
        )}

        {/* Bar chart */}
        {d.type === 'bar' && d.data.map((p, i) => {
          const bx = P.l + i * barStep + (barStep - barW) / 2;
          const by = toY(p.value, maxY);
          const bh = toY(0, maxY) - by;
          return (
            <rect
              key={i}
              x={bx} y={by} width={barW} height={Math.max(0, bh)}
              fill="rgb(var(--c-orange))" opacity="0.8" rx="2"
              className="chart-bar"
            />
          );
        })}

        {/* Scatter chart */}
        {d.type === 'scatter' && d.data.map((p, i) => (
          <circle
            key={i}
            cx={toX(i, n)} cy={toY(p.value, maxY)}
            r="3.5" fill="none"
            stroke="rgb(var(--c-orange))" strokeWidth="1.5"
          />
        ))}

        {/* X-axis ticks + labels */}
        {d.data.map((p, i) => {
          const tx = d.type === 'bar'
            ? P.l + i * barStep + barStep / 2
            : toX(i, n);
          return (
            <g key={i}>
              <line
                x1={tx} y1={P.t + IH} x2={tx} y2={P.t + IH + 4}
                stroke="rgb(var(--c-text2))" strokeWidth="1"
              />
              <text
                x={tx} y={P.t + IH + 14}
                textAnchor="middle" fontSize={8}
                fill="rgb(var(--c-text3))"
              >
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
