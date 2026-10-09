import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { formatCompact } from "../../attractors/shared/types";
import { initialStats, nextStatsSample, StatsSample } from "../../lib/statsSample";
import { tokens } from "../../theme/tokens";

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const Grid = styled.dl<{ $compact: boolean }>`
  display: grid;
  grid-template-columns: ${p => (p.$compact ? "auto auto auto" : "auto 1fr")};
  gap: ${p => (p.$compact ? "0 10px" : "4px 12px")};
  margin: 0;
  font: 400 11px/1.6 ${tokens.font.mono};
  dt { color: ${p => p.theme.textMid}; display: ${p => (p.$compact ? "none" : "block")}; }
  dd { margin: 0; color: ${p => p.theme.primary}; text-align: ${p => (p.$compact ? "left" : "right")}; }
`;

interface Props {
  statsRef: React.MutableRefObject<{ maxHits: number; totalIterations: number }>;
  running: boolean; rendering: boolean; isFractal: boolean; maxIter?: number; compact?: boolean;
}

export const StatsReadout: React.FC<Props> = ({ statsRef, running, rendering, isFractal, maxIter, compact = false }) => {
  const [sample, setSample] = useState<StatsSample>(initialStats);
  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
    if (isFractal) return;
    let last = initialStats;
    const id = window.setInterval(() => {
      last = nextStatsSample(last, statsRef.current.totalIterations, performance.now(), runningRef.current);
      setSample(last);
    }, 250);
    return () => window.clearInterval(id);
  }, [statsRef, isFractal]);

  if (rendering) return <Grid $compact={compact}><dt>Status</dt><dd>Computing…</dd></Grid>;
  if (isFractal) return <Grid $compact={compact}><dt>Complexity</dt><dd>{maxIter ?? "—"}</dd></Grid>;

  return (
    <Grid $compact={compact} aria-label="Render statistics">
      <dt>Iterations</dt><dd>{formatCompact(sample.iterations)}</dd>
      <dt>Points/sec</dt><dd>{formatCompact(Math.round(sample.rate))}{compact ? " pts/s" : ""}</dd>
      <dt>Elapsed</dt><dd>{formatDuration(sample.elapsedMs)}</dd>
    </Grid>
  );
};
