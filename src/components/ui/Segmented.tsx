import React from "react";
import styled, { css } from "styled-components";
import { tokens } from "../../theme/tokens";

type Variant = "box" | "chips" | "pills";

const Group = styled.div<{ $variant: Variant; $columns?: number }>`
  display: ${p => (p.$variant === "pills" ? "flex" : "grid")};
  gap: ${p => (p.$variant === "pills" ? "4px" : "6px")};
  ${p => p.$variant !== "pills" && (p.$columns
    ? css`grid-template-columns: repeat(${p.$columns}, 1fr);`
    : css`grid-auto-flow: column; grid-auto-columns: 1fr;`)}
  ${p => p.$variant === "box" && css`
    gap: 4px;
    padding: 4px;
    background: rgba(11, 14, 23, 0.8);
    border: 1px solid ${p.theme.hairline};
    border-radius: 8px;
  `}
`;

const Option = styled.button<{ $active: boolean; $variant: Variant }>`
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  ${p => p.$variant === "pills"
    ? css`
      padding: 2px 8px; border-radius: ${tokens.radius.full};
      font: 400 12px/1rem ${tokens.font.ui};
      border: 1px solid ${p.$active ? p.theme.primaryBorder : "transparent"};
      background: ${p.$active ? p.theme.primarySoft : p.theme.surface};
      color: ${p.$active ? p.theme.primary : p.theme.textMid};
    `
    : css`
      min-height: 26px; padding: 4px 6px; border-radius: 4px;
      font: ${p.$active ? 600 : 400} 10px/1rem ${tokens.font.mono}; letter-spacing: 0.02em;
      border: 1px solid ${p.$active ? p.theme.primaryBorder : p.theme.hairline};
      background: ${p.$active ? p.theme.primarySoft : p.theme.surface};
      color: ${p.$active ? p.theme.primary : p.theme.textMid};
      box-shadow: ${p.$active ? p.theme.glowPrimary : "none"};
    `}
  &:hover { color: ${p => (p.$active ? p.theme.primary : p.theme.textHigh)}; }
  &:focus-visible { outline: 2px solid ${p => p.theme.focusBorder}; outline-offset: 1px; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 40px; }
`;

interface SegmentedProps<T extends string | number> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  ariaLabel: string;
  variant?: Variant;
  columns?: number;
}

export function Segmented<T extends string | number>({ value, options, onChange, ariaLabel, variant = "chips", columns }: SegmentedProps<T>) {
  return (
    <Group role="radiogroup" aria-label={ariaLabel} $variant={variant} $columns={columns}>
      {options.map(o => (
        <Option key={String(o.value)} type="button" role="radio" aria-checked={o.value === value}
          $active={o.value === value} $variant={variant} onClick={() => onChange(o.value)}>
          {o.label}
        </Option>
      ))}
    </Group>
  );
}
