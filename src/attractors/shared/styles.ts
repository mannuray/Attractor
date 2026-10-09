import React from "react";
import styled, { css } from "styled-components";
import { tokens } from "../../theme/tokens";

// Card style
// Wrapper around a system's controls; sections are separated by the inspector layout itself.
export const Card = styled.div`
  display: flex;
  flex-direction: column;
`;

// Field wrapper
export const Field = styled.div`
  margin-bottom: 20px;
`;

// Label
export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font: 600 11px/1 ${tokens.font.mono};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${p => p.theme.textMid};
`;

// Small uppercase section label used across panels
export const SectionLabel = styled.label`
  display: block;
  margin: 0 0 8px;
  font: 600 11px/1 ${tokens.font.mono};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${p => p.theme.textMid};
`;

// Base input styles
const inputBase = css`
  width: 100%;
  min-height: 36px;
  padding: 8px 12px;
  font: 500 12px ${tokens.font.ui};
  border-radius: 10px;
  border: 1px solid ${p => p.theme.hairline};
  box-sizing: border-box;
  background: ${p => p.theme.surface};
  color: ${p => p.theme.textHigh};
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: ${p => p.theme.focusBorder};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// Input
export const Input = styled.input<{ $editable?: boolean }>`
  ${inputBase}
  background: ${props => props.$editable ? props.theme.darkestBg : props.theme.darkBg};
`;

// Select
export const Select = styled.select`
  ${inputBase}
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394A3B8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;

  option {
    background: ${p => p.theme.surface};
    color: ${p => p.theme.textHigh};
  }
`;

// Parameter row layout
export const ParameterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

// Parameter grid
const ParameterCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  margin-bottom: 12px;
  background: rgba(11, 14, 23, 0.6);
  border: 1px solid ${p => p.theme.hairline};
  border-radius: 12px;
  /* Stitch alternates cyan / violet accents down the parameter list */
  & > *:nth-child(odd of :not([data-card-head])) { --param-accent: ${p => p.theme.primary}; }
  & > *:nth-child(even of :not([data-card-head])) { --param-accent: ${p => p.theme.secondary}; }
`;
const ParameterCardHead = styled.div`
  font: 600 11px/0.875rem ${tokens.font.mono};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${p => p.theme.primary};
`;

// Display value as text
export const ValueText = styled.span<{ $clickable?: boolean }>`
  min-width: 64px;
  height: 24px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  border-radius: 4px;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.hairlineStrong};
  font: 400 12px/1rem ${tokens.font.mono};
  font-variant-numeric: tabular-nums;
  color: var(--param-accent, ${p => p.theme.primary});
  ${props => props.$clickable && css`
    cursor: text;
    &:hover { border-color: var(--param-accent, ${props.theme.primary}); }
  `}
`;

// Compact inline input
export const ValueInput = styled.input`
  width: 80px;
  height: 24px;
  padding: 0 6px;
  font: 400 12px/1rem ${tokens.font.mono};
  text-align: right;
  background: ${p => p.theme.surface};
  border: 1px solid var(--param-accent, ${p => p.theme.primary});
  border-radius: 4px;
  color: var(--param-accent, ${p => p.theme.primary});
  outline: none;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;

  @media (max-width: ${tokens.breakpoint.mobileMax}px) {
    font-size: 16px;
    height: 32px;
  }
`;

// Wrapper for parameter row + slider
export const ParameterRowWithSlider = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// Range slider
export const SliderInput = styled.input.attrs({ type: "range" })`
  width: 100%;
  height: 4px;
  margin: 6px 0;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  background: linear-gradient(
    to right,
    var(--param-accent, ${p => p.theme.primary}) 0%,
    var(--param-accent, ${p => p.theme.primary}) var(--val, 50%),
    ${p => p.theme.surfaceHighest} var(--val, 50%),
    ${p => p.theme.surfaceHighest} 100%
  );
  cursor: pointer;
  border-radius: 8px;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--param-accent, ${p => p.theme.primary});
    border: none;
    box-shadow: 0 0 10px -1px var(--param-accent, ${p => p.theme.primary});
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: none;
    border-radius: 50%;
    background: var(--param-accent, ${p => p.theme.primary});
  }

  @media (max-width: ${tokens.breakpoint.mobileMax}px) {
    height: 24px;
    padding: 10px 0;
    background-clip: content-box;
    &::-webkit-slider-thumb { width: 22px; height: 22px; }
  }
`;

// Titled card wrapping a system's parameter rows (one per system's Controls).
export const ParameterGrid: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
  React.createElement(
    ParameterCard,
    { role: "group", "aria-label": "Parameters" },
    React.createElement(ParameterCardHead, { "data-card-head": "", "aria-hidden": true } as React.HTMLAttributes<HTMLDivElement>, "Parameters"),
    children
  );
