import React from "react";
import styled, { css } from "styled-components";
import { ThemeColors } from "../../theme/themes";
import { tokens } from "../../theme/tokens";

// Color helper object that works with styled-components props
export const colors = {
  accent: (props: { theme: ThemeColors }) => props.theme.accent,
  accentSoft: (props: { theme: ThemeColors }) => props.theme.accentSoft,
  accentLight: (props: { theme: ThemeColors }) => props.theme.accentLight,
  accentDim: (props: { theme: ThemeColors }) => props.theme.accentDim,
  accentHover: (props: { theme: ThemeColors }) => props.theme.accentHover,
  accentBorderLight: (props: { theme: ThemeColors }) => props.theme.accentBorderLight,
  accentBorderSoft: (props: { theme: ThemeColors }) => props.theme.accentBorderSoft,
  accentBorder: (props: { theme: ThemeColors }) => props.theme.accentBorder,
  accentMuted: (props: { theme: ThemeColors }) => props.theme.accentMuted,
  accentSubtle: (props: { theme: ThemeColors }) => props.theme.accentSubtle,
  glassBg: (props: { theme: ThemeColors }) => props.theme.glassBg,
  darkBg: (props: { theme: ThemeColors }) => props.theme.darkBg,
  darkerBg: (props: { theme: ThemeColors }) => props.theme.darkerBg,
  darkestBg: (props: { theme: ThemeColors }) => props.theme.darkestBg,
  white: (props: { theme: ThemeColors }) => props.theme.white,
  shadow: (props: { theme: ThemeColors }) => props.theme.shadow,
  success: (props: { theme: ThemeColors }) => props.theme.success,
  danger: (props: { theme: ThemeColors }) => props.theme.danger,
  bgPage: (props: { theme: ThemeColors }) => props.theme.bgPage,
};

// Glass effect mixin
export const glassEffect = css`
  background: ${p => p.theme.glass1};
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid ${p => p.theme.hairline};
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
`;

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

// Button base
const buttonBase = css`
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    filter: brightness(1.2);
    box-shadow: 0 0 15px ${colors.accentMuted};
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Primary button
export const ButtonPrimary = styled.button`
  ${buttonBase}
  padding: 10px 16px;
  font-size: 11px;
  background: ${colors.accent};
  color: ${colors.bgPage};
  border-radius: 6px;
  box-shadow: 0 4px 12px ${colors.accentMuted};
`;

// Success button
export const ButtonSuccess = styled.button`
  ${buttonBase}
  padding: 12px 20px;
  font-size: 12px;
  background: ${colors.success};
  color: white;
  border-radius: 8px;
`;

// Danger button
export const ButtonDanger = styled.button`
  ${buttonBase}
  padding: 12px 20px;
  font-size: 12px;
  background: ${colors.danger};
  color: white;
  border-radius: 8px;
`;

// Secondary button
export const ButtonSecondary = styled.button`
  ${buttonBase}
  padding: 10px 16px;
  font-size: 11px;
  background: transparent;
  color: ${colors.accent};
  border: 1px solid ${colors.accentBorder};
  border-radius: 6px;

  &:hover {
    background: ${colors.accentSubtle};
    border-color: ${colors.accent};
  }
`;

// Small button
export const ButtonSmall = styled.button`
  ${buttonBase}
  padding: 6px 10px;
  font-size: 10px;
  background: ${colors.darkestBg};
  color: ${colors.accentLight};
  border: 1px solid ${colors.accentBorder};
  border-radius: 4px;
  min-width: 28px;

  &:hover {
    border-color: ${colors.accent};
    color: white;
  }
`;

// Floating button
export const FloatingButton = styled.button`
  ${buttonBase}
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${p => p.theme.hairline};
  border-radius: 10px;
  color: ${p => p.theme.textHigh};

  &:hover {
    border-color: ${p => p.theme.focusBorder};
    box-shadow: none;
  }
`;

// Glass panel
export const GlassPanel = styled.div`
  ${glassEffect}
`;

// Flex row
export const FlexRow = styled.div<{ $gap?: string; $align?: string; $justify?: string }>`
  display: flex;
  flex-direction: row;
  gap: ${props => props.$gap || "12px"};
  align-items: ${props => props.$align || "center"};
  justify-content: ${props => props.$justify || "flex-start"};
`;

// Flex column
export const FlexColumn = styled.div<{ $gap?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$gap || "12px"};
`;

// Section header
export const SectionHeader = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: ${props => props.$collapsed ? "0" : "12px"};
  user-select: none;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font: 600 11px/1 ${tokens.font.mono};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${p => p.theme.textMid};
`;

export const CollapseIcon = styled.span<{ $collapsed?: boolean }>`
  font-size: 9px;
  color: ${p => p.theme.textMid};
  transform: rotate(${props => props.$collapsed ? "-90deg" : "0"});
  transition: transform 0.2s ease;
`;

// Stats row
export const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  font: 400 11px ${tokens.font.mono};
  color: ${p => p.theme.textMid};
  padding: 10px 0;
  border-top: 1px solid ${p => p.theme.hairline};
`;

export const StatLabel = styled.span`
  font-weight: 500;
`;

export const StatValue = styled.span`
  color: ${p => p.theme.primary};
  font-weight: 500;
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
