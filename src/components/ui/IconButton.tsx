import React from "react";
import styled, { css } from "styled-components";
import { tokens } from "../../theme/tokens";

type Variant = "ghost" | "primary" | "soft";
type Size = "sm" | "md" | "lg";
const SIZES: Record<Size, string> = { sm: "32px", md: "40px", lg: "52px" };

const Btn = styled.button<{ $variant: Variant; $size: Size; $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: ${p => SIZES[p.$size]};
  height: ${p => SIZES[p.$size]};
  padding: 0 ${p => (p.$size === "lg" ? "0" : "10px")};
  border-radius: ${p => (p.$size === "lg" ? tokens.radius.full : "10px")};
  font: 500 12px/1 ${tokens.font.ui};
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  ${p => p.$variant === "primary" && css`
    background: ${p.theme.primaryContainer};
    color: ${p.theme.onPrimary};
    border: none;
    font-weight: 600;
    box-shadow: ${p.theme.glowPrimary};
    &:hover { background: ${p.theme.primary}; }
    &:active { transform: scale(0.95); }
  `}
  ${p => p.$variant === "soft" && css`
    background: ${p.$active ? p.theme.primarySoft : "rgba(255, 255, 255, 0.04)"};
    color: ${p.$active ? p.theme.primary : p.theme.textHigh};
    border: 1px solid ${p.$active ? p.theme.primaryBorder : p.theme.hairline};
    &:hover { border-color: ${p.theme.focusBorder}; }
  `}
  ${p => p.$variant === "ghost" && css`
    background: ${p.$active ? p.theme.primarySoft : "transparent"};
    color: ${p.$active ? p.theme.primary : p.theme.textMid};
    border: 1px solid transparent;
    &:hover { color: ${p.theme.textHigh}; background: rgba(255, 255, 255, 0.06); }
  `}
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid ${p => p.theme.focusBorder}; outline-offset: 2px; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) {
    min-width: ${p => (p.$size === "sm" ? "44px" : SIZES[p.$size])};
    height: ${p => (p.$size === "sm" ? "44px" : SIZES[p.$size])};
  }
`;

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
  variant?: Variant;
  size?: Size;
};

export const IconButton: React.FC<Props> = ({ label, active = false, variant = "ghost", size = "md", children, ...rest }) => (
  <Btn type="button" aria-label={label} title={label} $variant={variant} $size={size} $active={active} {...rest}>
    {children}
  </Btn>
);
