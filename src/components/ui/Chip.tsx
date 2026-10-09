import React from "react";
import styled from "styled-components";
import { tokens } from "../../theme/tokens";

const ChipButton = styled.button<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: ${tokens.radius.full};
  border: 1px solid ${p => (p.$selected ? p.theme.primaryBorder : p.theme.hairline)};
  background: ${p => (p.$selected ? p.theme.primarySoft : "rgba(255, 255, 255, 0.03)")};
  color: ${p => (p.$selected ? p.theme.primary : p.theme.textMid)};
  font: 500 12px/1 ${tokens.font.ui};
  cursor: pointer;
  white-space: nowrap;
  &::before {
    content: "";
    display: ${p => (p.$selected ? "block" : "none")};
    width: 4px; height: 4px; border-radius: 50%;
    background: ${p => p.theme.primary};
    box-shadow: ${p => p.theme.glowPrimary};
  }
  &:focus-visible { outline: 2px solid ${p => p.theme.focusBorder}; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 44px; }
`;

export const Chip: React.FC<{ selected: boolean; onClick: () => void; children: React.ReactNode }> = ({ selected, onClick, children }) => (
  <ChipButton type="button" aria-pressed={selected} $selected={selected} onClick={onClick}>{children}</ChipButton>
);
