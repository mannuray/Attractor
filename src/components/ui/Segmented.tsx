import React from "react";
import styled from "styled-components";
import { tokens } from "../../theme/tokens";

const Group = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 4px;
  padding: 4px;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.hairline};
  border-radius: ${tokens.radius.md};
`;

const Option = styled.button<{ $active: boolean; $size: "sm" | "md" }>`
  min-height: ${p => (p.$size === "sm" ? "28px" : "36px")};
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${p => (p.$active ? p.theme.primaryBorder : "transparent")};
  background: ${p => (p.$active ? p.theme.primarySoft : "transparent")};
  color: ${p => (p.$active ? p.theme.primary : p.theme.textMid)};
  font: 500 12px/1 ${tokens.font.mono};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  &:hover { color: ${p => p.theme.textHigh}; }
  &:focus-visible { outline: 2px solid ${p => p.theme.focusBorder}; outline-offset: 1px; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 44px; }
`;

interface SegmentedProps<T extends string | number> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
}

export function Segmented<T extends string | number>({ value, options, onChange, ariaLabel, size = "md" }: SegmentedProps<T>) {
  return (
    <Group role="radiogroup" aria-label={ariaLabel}>
      {options.map(o => (
        <Option key={String(o.value)} type="button" role="radio" aria-checked={o.value === value}
          $active={o.value === value} $size={size} onClick={() => onChange(o.value)}>
          {o.label}
        </Option>
      ))}
    </Group>
  );
}
