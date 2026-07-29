import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { formatCompact } from '../../utils/format';

/* ═══════════════════════════════════════════════════════════════════════════
   CHART PRIMITIVES — hand-rolled SVG, zero dependencies.

   Rules this file obeys, so every chart in the admin reads as one system:
     · one accent series, achromatic grid — the design system allows no second hue
     · 2px lines, 4px rounded data-ends, ≥8px hover markers with a 2px surface ring
     · axes and gridlines stay recessive (line / ink-3), never compete with data
     · every plotted chart ships a hover layer: crosshair or per-mark tooltip
     · values wear text tokens (ink / ink-2 / ink-3), never the series colour
   ═══════════════════════════════════════════════════════════════════════════ */

const ACCENT = '#4f46e5';
const GRID = '#e4e4e7';
const MUTED = '#71717a';
const SURFACE = '#ffffff';

/* Container width, measured — SVG text must not be scaled by a viewBox. */
function useMeasure() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(Math.round(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}

/* Axis maxima land on 1 / 2 / 5 × 10ⁿ so the gridlines read as round numbers. */
function niceMax(value) {
  if (!value || value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  const n = value / base;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * base;
}

function EmptyPlot({ height = 220, label = "Bu davr uchun ma'lumot yo'q" }) {
  return (
    <div
      className="flex items-center justify-center font-mono text-[11px] uppercase tracking-widest text-ink-3"
      style={{ height }}
    >
      {label}
    </div>
  );
}

/* ── Tooltip ─────────────────────────────────────────────────────────────────
   Plain HTML above the SVG: real text rendering, real wrapping, no foreignObject. */
function Tooltip({ x, y, width, title, rows }) {
  const clamped = Math.min(Math.max(x, 78), Math.max(width - 78, 78));
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-line bg-panel px-3 py-2 shadow-md"
      style={{ left: clamped, top: Math.max(y - 12, 0) }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-3 whitespace-nowrap">{title}</p>
      {rows.map((row) => (
        <p key={row.label} className="mt-1 flex items-baseline gap-3 whitespace-nowrap">
          <span className="text-xs text-ink-3">{row.label}</span>
          <span className="ml-auto font-mono text-xs font-medium text-ink figures">{row.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ═══════════════════════ TREND — area + line, crosshair ══════════════════ */
export function TrendChart({ points, height = 260, formatValue = (v) => String(v), tooltipRows }) {
  const [ref, width] = useMeasure();
  const [hover, setHover] = useState(null);

  const hasData = points.some((p) => p.value > 0);

  const pad = { top: 16, right: 12, bottom: 30, left: 60 };
  const plotW = Math.max(width - pad.left - pad.right, 0);
  const plotH = height - pad.top - pad.bottom;

  const max = niceMax(Math.max(...points.map((p) => p.value), 0));
  const stepX = points.length > 1 ? plotW / (points.length - 1) : 0;
  const xAt = (i) => pad.left + i * stepX;
  const yAt = (v) => pad.top + plotH - (v / max) * plotH;

  const onMove = useCallback(
    (e) => {
      const box = e.currentTarget.getBoundingClientRect();
      const rel = e.clientX - box.left - pad.left;
      if (!stepX && points.length > 1) return;
      const i = Math.min(points.length - 1, Math.max(0, Math.round(stepX ? rel / stepX : 0)));
      setHover(i);
    },
    [stepX, points.length, pad.left]
  );

  if (width === 0) return <div ref={ref} style={{ height }} />;
  if (!hasData) {
    return (
      <div ref={ref}>
        <EmptyPlot height={height} />
      </div>
    );
  }

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(p.value)}`).join(' ');
  const area = `${line} L${xAt(points.length - 1)},${pad.top + plotH} L${xAt(0)},${pad.top + plotH} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  /* Thin out x labels so they never collide, whatever the bucket count. */
  const labelEvery = Math.ceil(points.length / Math.max(Math.floor(plotW / 64), 1));

  return (
    <div ref={ref} className="relative">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Davr bo'yicha dinamika grafigi"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        style={{ display: 'block' }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={yAt(t)} y2={yAt(t)} stroke={GRID} strokeWidth="1" />
            <text
              x={pad.left - 10}
              y={yAt(t)}
              textAnchor="end"
              dominantBaseline="middle"
              fill={MUTED}
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {formatCompact(t)}
            </text>
          </g>
        ))}

        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.16" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trend-fill)" />
        <path d={line} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text
              key={p.key ?? i}
              x={xAt(i)}
              y={height - 10}
              textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
              fill={MUTED}
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {p.label}
            </text>
          ) : null
        )}

        {hover !== null && (
          <g>
            <line
              x1={xAt(hover)}
              x2={xAt(hover)}
              y1={pad.top}
              y2={pad.top + plotH}
              stroke={MUTED}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={xAt(hover)} cy={yAt(points[hover].value)} r="5" fill={ACCENT} stroke={SURFACE} strokeWidth="2" />
          </g>
        )}
      </svg>

      {hover !== null && (
        <Tooltip
          x={xAt(hover)}
          y={yAt(points[hover].value)}
          width={width}
          title={points[hover].fullLabel || points[hover].label}
          rows={tooltipRows ? tooltipRows(points[hover]) : [{ label: 'Qiymat', value: formatValue(points[hover].value) }]}
        />
      )}
    </div>
  );
}

/* ═══════════════════════ BARS — horizontal, ranked ═══════════════════════ */
export function BarRows({ rows, formatValue = (v) => String(v), emptyLabel, indexed = true }) {
  const [active, setActive] = useState(null);

  if (!rows || rows.length === 0) {
    return <EmptyPlot height={180} label={emptyLabel || "Ma'lumot yo'q"} />;
  }

  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <ol className="flex flex-col gap-4">
      {rows.map((row, i) => {
        const pct = Math.max((row.value / max) * 100, row.value > 0 ? 1.5 : 0);
        return (
          <li
            key={row.key}
            onMouseEnter={() => setActive(row.key)}
            onMouseLeave={() => setActive(null)}
            className="group"
          >
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <span className="flex items-baseline gap-3 min-w-0">
                {indexed && <span className="t-index shrink-0">{String(i + 1).padStart(2, '0')}</span>}
                <span className="text-sm text-ink-2 truncate">{row.label}</span>
              </span>
              <span className="shrink-0 font-mono text-xs font-medium text-ink figures">
                {formatValue(row.value)}
              </span>
            </div>
            <div className="h-2 bg-veil rounded-xs overflow-hidden">
              <div
                className="h-full rounded-r-md transition-[width,opacity] duration-300 ease-swiss"
                style={{
                  width: `${pct}%`,
                  backgroundColor: ACCENT,
                  opacity: active && active !== row.key ? 0.4 : 1,
                }}
              />
            </div>
            {row.hint && (
              <p className="mt-1.5 text-xs text-ink-3 tabular-nums">{row.hint}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ═══════════════════════ FUNNEL — stepped bars + drop-off ════════════════ */
export function FunnelChart({ steps }) {
  const top = steps[0]?.value || 1;

  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const pct = Math.min(100, (step.value / top) * 100);
        const prev = i > 0 ? steps[i - 1].value : null;
        const conv = prev ? (step.value / prev) * 100 : null;
        return (
          <li key={step.label}>
            {i > 0 && (
              <div className="flex items-center gap-2 pl-1 py-2">
                <span className="block w-px h-4 bg-line" />
                <span className="font-mono text-[10px] tracking-[0.06em] text-ink-3 figures">
                  {conv !== null ? `${conv.toFixed(1)}%` : '—'}
                  {prev > step.value ? ` · ${(prev - step.value).toLocaleString('ru-RU')} yo'qotildi` : ''}
                </span>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <span className="flex items-baseline gap-3 min-w-0">
                <span className="t-index shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className={`text-sm truncate ${step.strong ? 'font-medium text-ink' : 'text-ink-2'}`}>
                  {step.label}
                </span>
              </span>
              <span className="shrink-0 font-mono text-xs font-medium text-ink figures">
                {step.value.toLocaleString('ru-RU')}
              </span>
            </div>
            <div className="h-2.5 bg-veil rounded-xs overflow-hidden">
              <div
                className="h-full rounded-r-md transition-[width] duration-300 ease-swiss"
                style={{ width: `${pct}%`, backgroundColor: ACCENT, opacity: step.strong ? 1 : 0.78 }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ═══════════════════════ DELTA — period-over-period chip ═════════════════ */
export function Delta({ current, previous }) {
  if (previous === undefined || previous === null) return null;
  if (!previous) {
    if (!current) return <span className="font-mono text-[11px] text-ink-3">—</span>;
    return <span className="font-mono text-[11px] text-positive">yangi</span>;
  }
  const change = ((current - previous) / previous) * 100;
  const flat = Math.abs(change) < 0.05;
  const tone = flat ? 'text-ink-3' : change > 0 ? 'text-positive' : 'text-critical';
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[11px] figures ${tone}`}>
      <span aria-hidden="true">{flat ? '→' : change > 0 ? '↑' : '↓'}</span>
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}
