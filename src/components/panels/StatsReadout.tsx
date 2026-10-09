import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { formatCompact } from "../../attractors/shared/types";
import { initialStats, nextStatsSample, StatsSample } from "../../lib/statsSample";
import { tokens } from "../../theme/tokens";

// Samples outlive the component: keyed by the render's stats ref, so remounting (breakpoint swap,
// collapsing the inspector) resumes the same clock instead of restarting it.
const samples = new WeakMap<object, StatsSample>();

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const Grid = styled.dl<{ $compact: boolean }>`
  margin: 0;
  display: grid;
  grid-template-columns: ${p => (p.$compact ? "auto auto auto" : "auto 1fr")};
  gap: ${p => (p.$compact ? "0 10px" : "4px 12px")};
  font: 400 11px/0.875rem ${tokens.font.mono};
  ${p => !p.$compact && `
    padding: 8px;
    background: rgba(11, 14, 23, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  `}
  dt { color: ${p => p.theme.textMid}; display: ${p => (p.$compact ? "none" : "block")}; }
  dd { margin: 0; text-align: ${p => (p.$compact ? "left" : "right")}; color: ${p => p.theme.textHigh}; }
  dd:nth-of-type(1) { color: ${p => p.theme.primary}; font-weight: 500; }
  dd:nth-of-type(3) { color: ${p => p.theme.secondary}; }
`;

interface Props {
  statsRef: React.MutableRefObject<{ maxHits: number; totalIterations: number }>;
  running: boolean; rendering: boolean; isFractal: boolean; maxIter?: number; compact?: boolean;
  renderProgress?: number | null;
}

export const StatsReadout: React.FC<Props> = ({ statsRef, running, rendering, isFractal, maxIter, compact = false, renderProgress = null }) => {
  const [sample, setSample] = useState<StatsSample>(() => samples.get(statsRef) ?? initialStats);
  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
    if (isFractal) return;
    let last = samples.get(statsRef) ?? initialStats;
    const id = window.setInterval(() => {
      const next = nextStatsSample(last, statsRef.current.totalIterations, performance.now(), runningRef.current);
      samples.set(statsRef, next);
      // Skip re-rendering when nothing visible changed (e.g. idle).
      if (next.iterations !== last.iterations || next.elapsedMs !== last.elapsedMs || next.rate !== last.rate) setSample(next);
      last = next;
    }, 250);
    return () => window.clearInterval(id);
  }, [statsRef, isFractal]);

  if (rendering) {
    const label = renderProgress == null ? "Computing…" : `Refining ${Math.round(renderProgress * 100)}%`;
    return <Grid $compact={compact}><dt>Status</dt><dd>{label}</dd></Grid>;
  }
  if (isFractal) return <Grid $compact={compact}><dt>Complexity</dt><dd>{maxIter ?? "—"}</dd></Grid>;

  return (
    <Grid $compact={compact} aria-label="Render statistics">
      <dt>Iterations:</dt><dd>{formatCompact(sample.iterations)}</dd>
      <dt>Points/sec:</dt><dd>{formatCompact(Math.round(sample.rate))}{compact ? " pts/s" : ""}</dd>
      <dt>Elapsed:</dt><dd>{formatDuration(sample.elapsedMs)}</dd>
    </Grid>
  );
};
