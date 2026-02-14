import styled, { css } from "styled-components";

// Color palette
export const colors = {
  accent: "rgba(255, 180, 120, 1)",
  accentSoft: "rgba(255, 180, 120, 0.8)",
  accentLight: "rgba(255, 180, 120, 0.7)",
  accentDim: "rgba(255, 180, 120, 0.6)",
  accentHover: "rgba(255, 180, 120, 0.4)",
  accentBorderLight: "rgba(255, 180, 120, 0.3)",
  accentBorderSoft: "rgba(255, 180, 120, 0.25)",
  accentBorder: "rgba(255, 180, 120, 0.2)",
  accentMuted: "rgba(255, 180, 120, 0.15)",
  accentSubtle: "rgba(255, 180, 120, 0.1)",
  glassBg: "rgba(255, 180, 120, 0.06)",
  darkBg: "rgba(0, 0, 0, 0.3)",
  darkerBg: "rgba(0, 0, 0, 0.4)",
  darkestBg: "rgba(0, 0, 0, 0.6)",
  white: "#ffffff",
  shadow: "rgba(0, 0, 0, 0.3)",
};

// Glass effect mixin
export const glassEffect = css`
  background: ${colors.glassBg};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${colors.accentBorder};
  border-radius: 16px;
  box-shadow: 0 8px 32px ${colors.shadow};
`;

// Card style
export const Card = styled.div`
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid ${colors.accentBorder};
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 8px 32px ${colors.shadow};
`;

// Field wrapper
export const Field = styled.div`
  margin-bottom: 16px;
`;

// Label
export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 600;
  color: ${colors.accentLight};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// Base input styles
const inputBase = css`
  width: 100%;
  padding: 12px 14px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid ${colors.accentBorder};
  box-sizing: border-box;
  background: ${colors.darkBg};
  color: ${colors.white};
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${colors.accentBorderLight};
    box-shadow: 0 0 0 2px ${colors.accentMuted};
  }

  &:disabled {
    background: rgba(0, 0, 0, 0.25);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
  }
`;

// Input
export const Input = styled.input<{ $editable?: boolean }>`
  ${inputBase}
  background: ${props => props.$editable ? colors.darkerBg : "rgba(0, 0, 0, 0.25)"};
  color: ${props => props.$editable ? colors.white : "rgba(255, 255, 255, 0.5)"};
`;

// Select
export const Select = styled.select`
  ${inputBase}
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f59e0b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 180, 120, 0.25);

  &:hover {
    border-color: rgba(255, 180, 120, 0.4);
    background-color: rgba(0, 0, 0, 0.5);
  }

  &:focus {
    border-color: #f59e0b;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  option {
    background: #1a1a2e;
    color: white;
    padding: 12px;
  }

  optgroup {
    background: #0f0f1a;
    color: #f59e0b;
    font-weight: 600;
    font-style: normal;
  }
`;

// Button base
const buttonBase = css`
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Primary button (orange gradient)
export const ButtonPrimary = styled.button`
  ${buttonBase}
  padding: 8px 16px;
  font-size: 13px;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);

  &:hover {
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.5);
  }
`;

// Success button (green gradient)
export const ButtonSuccess = styled.button`
  ${buttonBase}
  padding: 14px 24px;
  font-size: 14px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);

  &:hover {
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6);
  }
`;

// Danger button (red gradient)
export const ButtonDanger = styled.button`
  ${buttonBase}
  padding: 14px 24px;
  font-size: 14px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);

  &:hover {
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
  }
`;

// Secondary button (glass)
export const ButtonSecondary = styled.button`
  ${buttonBase}
  padding: 10px 16px;
  font-size: 13px;
  background: ${colors.darkBg};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: ${colors.white};
  border: 1px solid ${colors.accentBorder};
  border-radius: 10px;

  &:hover {
    border-color: ${colors.accentBorderLight};
    background: rgba(0, 0, 0, 0.4);
  }
`;

// Small button
export const ButtonSmall = styled.button`
  ${buttonBase}
  padding: 8px 12px;
  font-size: 14px;
  background: ${colors.darkBg};
  color: ${colors.white};
  border: 1px solid ${colors.accentBorder};
  border-radius: 8px;
  min-width: 36px;

  &:hover {
    border-color: ${colors.accentBorderLight};
    background: rgba(0, 0, 0, 0.4);
  }
`;

// Floating button (for panels)
export const FloatingButton = styled.button`
  ${buttonBase}
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: ${colors.accentMuted};
  border: 1px solid ${colors.accentBorderLight};
  border-radius: 10px;
  color: ${colors.white};

  &:hover {
    background: rgba(255, 180, 120, 0.25);
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
  gap: ${props => props.$gap || "8px"};
  align-items: ${props => props.$align || "center"};
  justify-content: ${props => props.$justify || "flex-start"};
`;

// Flex column
export const FlexColumn = styled.div<{ $gap?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$gap || "8px"};
`;

// Section header (collapsible)
export const SectionHeader = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 8px 0;
  border-bottom: 1px solid ${colors.accentBorder};
  margin-bottom: ${props => props.$collapsed ? "0" : "16px"};
  user-select: none;

  &:hover {
    opacity: 0.9;
  }
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.accentLight};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const CollapseIcon = styled.span<{ $collapsed?: boolean }>`
  font-size: 12px;
  color: ${colors.accentLight};
  transform: rotate(${props => props.$collapsed ? "-90deg" : "0"});
  transition: transform 0.2s ease;
`;

// Parameter grid (single column)
export const ParameterGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

// Stats row
export const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: ${colors.accentDim};
  padding: 8px 0;
  border-top: 1px solid ${colors.accentBorder};
`;

export const StatLabel = styled.span`
  font-weight: 500;
`;

export const StatValue = styled.span`
  color: ${colors.white};
  font-weight: 600;
`;

// Parameter row layout - horizontal with label left, value right
export const ParameterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
`;

// Display value as text (view mode)
export const ValueText = styled.span<{ $clickable?: boolean }>`
  font-size: 13px;
  font-weight: 500;
  color: ${colors.white};
  font-variant-numeric: tabular-nums;
  text-align: right;
  ${props => props.$clickable && `
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    &:hover {
      background: ${colors.accentMuted};
    }
  `}
`;

// Compact inline input for editing
export const ValueInput = styled.input`
  width: 90px;
  padding: 4px 8px;
  font-size: 13px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  text-align: right;
  background: ${colors.darkerBg};
  border: 1px solid ${colors.accentBorderLight};
  border-radius: 6px;
  color: ${colors.white};
  outline: none;

  &:focus {
    border-color: #f59e0b;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
  }

  /* Hide spin buttons */
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

// Range slider styled to match the glass/amber theme
export const SliderInput = styled.input.attrs({ type: "range" })`
  width: 100%;
  height: 4px;
  margin: 4px 0 2px;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: 4px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 2px;
    border: 1px solid ${colors.accentBorder};
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${colors.accent};
    margin-top: -6px;
    border: none;
    box-shadow: 0 0 4px rgba(255, 180, 120, 0.4);
    transition: box-shadow 0.15s ease;
  }

  &:hover::-webkit-slider-thumb {
    box-shadow: 0 0 8px rgba(255, 180, 120, 0.7);
  }

  &::-moz-range-track {
    height: 4px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 2px;
    border: 1px solid ${colors.accentBorder};
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${colors.accent};
    border: none;
    box-shadow: 0 0 4px rgba(255, 180, 120, 0.4);
    transition: box-shadow 0.15s ease;
  }

  &:hover::-moz-range-thumb {
    box-shadow: 0 0 8px rgba(255, 180, 120, 0.7);
  }
`;
