import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import { useShare } from "../../hooks/useShare";
import { IconButton } from "../ui/IconButton";
import { Icon } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

const Bar = styled.header<{ $compact: boolean }>`
  display: flex; align-items: center; gap: 12px;
  height: ${p => (p.$compact ? "auto" : "52px")};
  padding: ${p => (p.$compact ? "calc(env(safe-area-inset-top) + 10px) 12px 0" : "0 16px")};
  background: ${p => (p.$compact ? "transparent" : p.theme.glass1)};
  backdrop-filter: ${p => (p.$compact ? "none" : "blur(16px) saturate(160%)")};
  -webkit-backdrop-filter: ${p => (p.$compact ? "none" : "blur(16px) saturate(160%)")};
  border-bottom: ${p => (p.$compact ? "none" : `1px solid ${p.theme.hairline}`)};
  z-index: ${tokens.z.toolbar};
`;
const Brand = styled.div`
  display: flex; align-items: center; gap: 8px;
  font: 600 15px ${tokens.font.ui}; color: ${p => p.theme.textHigh}; white-space: nowrap;
`;
const Mark = styled.span`
  width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center;
  border: 1px solid ${p => p.theme.primaryBorder}; color: ${p => p.theme.primary}; box-shadow: ${p => p.theme.glowPrimary};
  font: 700 14px ${tokens.font.mono};
`;
const Pill = styled.button`
  display: inline-flex; align-items: center; gap: 8px; min-height: 36px; max-width: 100%;
  padding: 0 14px; border-radius: ${tokens.radius.full}; cursor: pointer;
  background: ${p => p.theme.glass1}; border: 1px solid ${p => p.theme.hairlineStrong};
  color: ${p => p.theme.textHigh}; font: 500 13px ${tokens.font.ui};
  span.label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: ${p => p.theme.primary}; box-shadow: ${p => p.theme.glowPrimary}; flex-shrink: 0; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 44px; }
`;
const Center = styled.div`flex: 1; min-width: 0; display: flex; justify-content: center;`;
const ThemeSelect = styled.select`
  min-height: 32px; border-radius: 8px; padding: 0 8px;
  background: transparent; color: ${p => p.theme.textMid}; border: 1px solid ${p => p.theme.hairline};
  font: 500 12px ${tokens.font.ui};
`;

interface Props { systemLabel: string; onSystemClick: () => void; onOpenExport: () => void; compact?: boolean }

export const TopBar: React.FC<Props> = ({ systemLabel, onSystemClick, onOpenExport, compact = false }) => {
  const navigate = useNavigate();
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const { status, share } = useShare();
  const shareText = status === "copied" ? "Copied" : status === "failed" ? "Couldn't copy" : "Share";

  return (
    <Bar $compact={compact}>
      <Brand><Mark>∞</Mark>{!compact && "Chaos Iterator"}</Brand>
      <Center>
        <Pill type="button" onClick={onSystemClick} aria-label={`${systemLabel} — change system`}>
          <span className="label">{systemLabel}</span><Icon name="chevronDown" size={14} />
        </Pill>
      </Center>
      {!compact && (
        <ThemeSelect aria-label="Theme" value={currentTheme} onChange={e => setTheme(e.target.value)}>
          {availableThemes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </ThemeSelect>
      )}
      {!compact && <IconButton label="Docs" onClick={() => navigate("/info")}><Icon name="info" size={16} /></IconButton>}
      <IconButton label="Share" variant={compact ? "soft" : "ghost"} active={status === "copied"} onClick={share}>
        <Icon name="share" size={16} />{!compact && ` ${shareText}`}
      </IconButton>
      <span role="status" aria-live="polite" style={{ position: "absolute", left: -9999 }}>{status !== "idle" ? shareText : ""}</span>
      {!compact && <IconButton label="Export" variant="primary" onClick={onOpenExport}><Icon name="download" size={16} /> Export</IconButton>}
    </Bar>
  );
};
