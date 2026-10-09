import React, { useRef, useState } from "react";
import styled from "styled-components";
import { Stop, addStop, moveStop, toHex } from "../../lib/colorRamp";
import { tokens } from "../../theme/tokens";

const Wrap = styled.div`position: relative; padding: 4px 0 4px; user-select: none;`;
const Bar = styled.div`
  height: 32px; padding: 2px; border-radius: 12px; cursor: copy;
  background: ${p => p.theme.surfaceLowest}; border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
  .fill { width: 100%; height: 100%; border-radius: 10px; }
`;
const Track = styled.div`position: relative; height: 26px; margin-top: -2px; touch-action: none;`;
const Handle = styled.button<{ $selected: boolean; $color: string }>`
  position: absolute; top: 0; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; padding: 0 4px;
  background: none; border: none; cursor: grab; touch-action: none; z-index: ${p => (p.$selected ? 2 : 1)};
  .tip {
    width: 0; height: 0;
    border-left: ${p => (p.$selected ? 6 : 5)}px solid transparent;
    border-right: ${p => (p.$selected ? 6 : 5)}px solid transparent;
    border-bottom: ${p => (p.$selected ? 7 : 6)}px solid ${p => (p.$selected ? p.theme.primary : "#94a3b8")};
  }
  .dot {
    margin-top: 2px; border-radius: 50%; background: ${p => p.$color};
    width: ${p => (p.$selected ? 16 : 14)}px; height: ${p => (p.$selected ? 16 : 14)}px;
    border: ${p => (p.$selected ? `2px solid ${p.theme.primary}` : "1px solid #94a3b8")};
    box-shadow: ${p => (p.$selected ? `0 0 0 2px rgba(76, 215, 246, 0.4), ${p.theme.glowPrimary}` : "0 2px 4px rgba(0,0,0,0.4)")};
    transition: transform 0.1s ease;
  }
  &:hover .dot { transform: scale(1.1); }
  &:focus-visible .dot { outline: 2px solid ${p => p.theme.focusBorder}; outline-offset: 2px; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) {
    padding: 0 8px;
    .dot { width: ${p => (p.$selected ? 26 : 22)}px; height: ${p => (p.$selected ? 26 : 22)}px; }
  }
`;
const Hint = styled.p`
  margin: 2px 0 0; text-align: center; font: 400 11px/0.875rem ${tokens.font.mono}; letter-spacing: -0.01em;
  color: ${p => p.theme.textLow};
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { margin-top: 10px; }
`;

export function rampGradient(stops: Stop[]) {
  return `linear-gradient(to right, ${stops.map(s => `${toHex(s)} ${Math.round(s.position * 1000) / 10}%`).join(", ")})`;
}

interface Props {
  stops: Stop[];
  selected: number;
  onSelect: (index: number) => void;
  /** Live update while dragging (local only). */
  onDraft: (stops: Stop[]) => void;
  /** Commit a finished change. */
  onCommit: (stops: Stop[], selected?: number) => void;
  touch?: boolean;
}

export const ColorRamp: React.FC<Props> = ({ stops, selected, onSelect, onDraft, onCommit, touch = false }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const draftRef = useRef<Stop[] | null>(null);

  const positionFrom = (clientX: number, el: HTMLElement | null) => {
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return r.width ? (clientX - r.left) / r.width : 0;
  };

  const onHandleDown = (i: number) => (e: React.PointerEvent) => {
    onSelect(i);
    if (i === 0 || i === stops.length - 1) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    setDragging(i);
    draftRef.current = null;
  };
  const onHandleMove = (i: number) => (e: React.PointerEvent) => {
    if (dragging !== i) return;
    const next = moveStop(stops, i, positionFrom(e.clientX, trackRef.current));
    draftRef.current = next;
    onDraft(next);
  };
  const endDrag = () => {
    if (dragging === null) return;
    setDragging(null);
    if (draftRef.current) onCommit(draftRef.current);
    draftRef.current = null;
  };

  const onBarDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { stops: next, index } = addStop(stops, positionFrom(e.clientX, e.currentTarget));
    onCommit(next, index);
  };

  return (
    <Wrap>
      <Bar onDoubleClick={onBarDoubleClick} title="Double-click to add a stop">
        <div className="fill" style={{ background: rampGradient(stops) }} />
      </Bar>
      <Track ref={trackRef}>
        {stops.map((s, i) => (
          <Handle key={i} type="button" aria-label={`Stop ${i + 1} at ${Math.round(s.position * 100)}%`}
            aria-pressed={i === selected} $selected={i === selected} $color={toHex(s)}
            style={{ left: `${s.position * 100}%` }}
            onPointerDown={onHandleDown(i)} onPointerMove={onHandleMove(i)}
            onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}
            onClick={() => onSelect(i)}>
            <span className="tip" /><span className="dot" />
          </Handle>
        ))}
      </Track>
      <Hint>{touch ? "Tap a stop to edit · Double-tap bar to add · Drag to move" : "Click a stop to edit · Double-click the bar to add · Drag to move"}</Hint>
    </Wrap>
  );
};
