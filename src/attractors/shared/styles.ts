import styled, { css } from "styled-components";
import { ThemeColors } from "../../theme/themes";

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
  background: ${colors.glassBg};
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid ${colors.accentBorder};
  border-radius: 12px;
  box-shadow: 0 8px 32px ${colors.shadow};
`;

// Card style
export const Card = styled.div`
  background: ${colors.darkerBg};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${colors.accentBorder};
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
`;

// Field wrapper
export const Field = styled.div`
  margin-bottom: 20px;
`;

// Label
export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 800;
  color: ${colors.accentLight};
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
`;

// Base input styles
const inputBase = css`
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid ${colors.accentBorder};
  box-sizing: border-box;
  background: ${colors.darkestBg};
  color: ${colors.white};
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${colors.accent};
    box-shadow: 0 0 0 2px ${colors.accentSubtle}, 0 0 10px ${colors.accentMuted};
  }

  &:disabled {
    background: rgba(0, 0, 0, 0.3);
    color: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
    border-color: ${colors.accentMuted};
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='cyan' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;

  &:hover:not(:disabled) {
    border-color: ${colors.accentLight};
  }

  option {
    background: ${colors.darkestBg};
    color: ${colors.white};
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
  font-size: 16px;
  background: ${colors.darkestBg};
  border: 1px solid ${colors.accentBorder};
  border-radius: 8px;
  color: ${colors.accent};
  backdrop-filter: blur(8px);

  &:hover {
    background: ${colors.accentSubtle};
    border-color: ${colors.accent};
    box-shadow: 0 0 12px ${colors.accentMuted};
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
  border-bottom: 1px solid ${colors.accentMuted};
  margin-bottom: ${props => props.$collapsed ? "0" : "16px"};
  user-select: none;

  &:hover {
    border-color: ${colors.accentBorderLight};
  }
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 10px;
  font-weight: 800;
  color: ${colors.accentDim};
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: 'JetBrains Mono', monospace;
`;

export const CollapseIcon = styled.span<{ $collapsed?: boolean }>`
  font-size: 9px;
  color: ${colors.accentDim};
  transform: rotate(${props => props.$collapsed ? "-90deg" : "0"});
  transition: transform 0.3s ease;
`;

// Stats row
export const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: ${colors.accentDim};
  padding: 10px 0;
  border-top: 1px solid ${colors.accentMuted};
  font-family: 'JetBrains Mono', monospace;
`;

export const StatLabel = styled.span`
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const StatValue = styled.span`
  color: ${colors.accentLight};
  font-weight: 700;
`;

// Parameter row layout
export const ParameterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
`;

// Parameter grid
export const ParameterGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

// Display value as text
export const ValueText = styled.span<{ $clickable?: boolean }>`
  font-size: 12px;
  font-weight: 700;
  color: ${colors.white};
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  text-align: right;
  ${props => props.$clickable && css`
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    background: ${props.theme.accentSubtle};
    &:hover {
      background: ${props.theme.accentMuted};
      color: ${props.theme.accent};
      box-shadow: 0 0 8px ${props.theme.accentSubtle};
    }
  `}
`;

// Compact inline input
export const ValueInput = styled.input`
  width: 70px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  text-align: right;
  background: ${colors.darkestBg};
  border: 1px solid ${colors.accentBorder};
  border-radius: 4px;
  color: ${colors.white};
  outline: none;

  &:focus {
    border-color: ${colors.accent};
    box-shadow: 0 0 8px ${colors.accentSubtle};
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

// Wrapper for parameter row + slider
export const ParameterRowWithSlider = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 0;
`;

// Range slider
export const SliderInput = styled.input.attrs({ type: "range" })`
  width: 100%;
  height: 4px;
  margin: 10px 0 8px;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  background: linear-gradient(
    to right, 
    ${colors.accent} 0%, 
    ${colors.accent} var(--val, 50%), 
    ${colors.accentMuted} var(--val, 50%), 
    ${colors.accentMuted} 100%
  );
  cursor: pointer;
  border-radius: 2px;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${colors.accent};
    border: 2px solid ${colors.bgPage};
    box-shadow: 0 0 8px ${colors.accentMuted};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover::-webkit-slider-thumb {
    transform: scale(1.3);
    box-shadow: 0 0 15px ${colors.accentSoft};
  }

  &::-moz-range-thumb {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${colors.accent};
    border: 2px solid ${colors.bgPage};
  }
`;
