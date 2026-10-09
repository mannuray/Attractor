import React, { useCallback, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import { useShare } from "../../hooks/useShare";
import { Icon } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

const pulse = keyframes`50% { opacity: 0.45; }`;

const Bar = styled.header<{ $compact: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: ${p => (p.$compact ? "auto" : "48px")};
  padding: ${p => (p.$compact ? "calc(env(safe-area-inset-top) + 10px) 12px 8px" : "0 16px")};
  background: ${p => (p.$compact ? "rgba(11, 14, 23, 0.7)" : p.theme.glassBar)};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid ${p => (p.$compact ? `rgba(${p.theme.primaryRgb}, 0.2)` : p.theme.hairline)};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  z-index: ${tokens.z.toolbar + 30};
`;
const Side = styled.div<{ $compact?: boolean }>`
  display: flex; align-items: center; gap: 12px; min-width: 0;
  flex: ${p => (p.$compact ? "0 1 auto" : "1 1 0")};
`;
const RightSide = styled(Side)`justify-content: flex-end; gap: 8px;`;
const Brand = styled.div`
  display: flex; align-items: center; gap: 8px; white-space: nowrap; min-width: 0;
  .compact-name { font-size: 15px; overflow: hidden; text-overflow: ellipsis; }
  @media (max-width: 380px) { .compact-name { display: none; } }
  font: 700 18px/1.5rem ${tokens.font.ui}; letter-spacing: -0.015em; color: ${p => p.theme.textHigh};
`;
const Mark = styled.span<{ $size: number }>`
  width: ${p => p.$size}px; height: ${p => p.$size}px; border-radius: 8px;
  display: grid; place-items: center; flex-shrink: 0;
  background: ${p => p.theme.primarySoft};
  border: 1px solid ${p => p.theme.primaryBorder};
  color: ${p => p.theme.primary};
  box-shadow: ${p => p.theme.glowPrimary};
`;
const PillWrap = styled.div<{ $compact?: boolean }>`
  position: relative; display: flex; justify-content: center; min-width: 0;
  flex: ${p => (p.$compact ? "1 1 auto" : "0 1 auto")};
`;
const Pill = styled.button<{ $compact: boolean }>`
  display: inline-flex; align-items: center; gap: 10px; max-width: 100%;
  min-height: ${p => (p.$compact ? "44px" : "30px")};
  padding: 0 12px; border-radius: ${tokens.radius.full}; cursor: pointer;
  background: rgba(24, 27, 37, 0.85);
  border: 1px solid ${p => (p.$compact ? `rgba(${p.theme.primaryRgb}, 0.3)` : p.theme.hairlineStrong)};
  color: ${p => p.theme.textHigh};
  font: 500 ${p => (p.$compact ? "12px/1rem " + tokens.font.mono : "13px/1.25rem " + tokens.font.ui)};
  transition: background 0.15s ease;
  &:hover { background: ${p => p.theme.surfaceHigh}; }
  .label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    background: ${p => p.theme.primary}; box-shadow: ${p => p.theme.glowPrimary};
    animation: ${pulse} 2s ease-in-out infinite;
  }
  .count {
    padding: 1px 6px; border-radius: 4px; flex-shrink: 0;
    background: ${p => p.theme.surfaceHighest}; color: ${p => p.theme.secondary};
    font: 400 10px/1rem ${tokens.font.mono}; text-transform: uppercase; letter-spacing: 0.02em;
  }
  .chev { color: ${p => p.theme.textMid}; }
`;
const Popover = styled.div`
  position: absolute; left: 50%; top: calc(100% + 6px); transform: translateX(-50%);
  width: 300px; max-height: min(70vh, 560px); overflow-y: auto; padding: 10px;
  background: ${p => p.theme.glass2};
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  z-index: ${tokens.z.modal - 1};
`;
const GhostIcon = styled.button`
  display: grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; cursor: pointer;
  background: transparent; border: none; color: ${p => p.theme.textMid};
  &:hover { color: ${p => p.theme.primary}; background: rgba(39, 42, 51, 0.5); }
`;
const ShareButton = styled.button<{ $compact: boolean; $state: string }>`
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap;
  height: ${p => (p.$compact ? "44px" : "30px")};
  min-width: ${p => (p.$compact ? "44px" : "auto")};
  justify-content: center;
  padding: 0 10px; border-radius: ${p => (p.$compact ? tokens.radius.full : "8px")};
  background: ${p => (p.$compact ? "rgba(54, 57, 67, 0.2)" : "rgba(39, 42, 51, 0.3)")};
  border: 1px solid ${p =>
    p.$state === "failed" ? p.theme.danger : p.$state === "copied" ? p.theme.primaryBorder : p.theme.hairline};
  color: ${p => (p.$state === "failed" ? p.theme.danger : p.$state === "copied" ? p.theme.primary : p.theme.textMid)};
  font: 400 13px/1.25rem ${tokens.font.ui};
  &:hover { color: ${p => p.theme.textHigh}; background: ${p => p.theme.surfaceHigh}; }
`;
const ExportButton = styled.button`
  display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 14px; border-radius: 8px;
  cursor: pointer; border: none; white-space: nowrap;
  background: ${p => p.theme.primaryContainer}; color: ${p => p.theme.onPrimary};
  font: 600 13px/1.25rem ${tokens.font.ui};
  box-shadow: ${p => p.theme.glowPrimary};
  transition: background 0.15s ease, transform 0.1s ease;
  &:hover { background: ${p => p.theme.primary}; }
  &:active { transform: scale(0.95); }
`;
const ThemeSelect = styled.select`
  height: 30px; border-radius: 8px; padding: 0 8px; cursor: pointer;
  background: transparent; color: ${p => p.theme.textMid}; border: 1px solid ${p => p.theme.hairline};
  font: 400 11px ${tokens.font.mono};
  option { background: ${p => p.theme.surface}; color: ${p => p.theme.textHigh}; }
`;
// Visible status for compact mode (mobile), where the Share button is icon-only.
const Toast = styled.span<{ $failed: boolean }>`
  position: absolute; right: 12px; top: calc(100% + 6px);
  padding: 4px 10px; border-radius: ${tokens.radius.full}; white-space: nowrap;
  background: ${p => p.theme.glass2}; border: 1px solid ${p => (p.$failed ? p.theme.danger : p.theme.primaryBorder)};
  color: ${p => (p.$failed ? p.theme.danger : p.theme.primary)};
  font: 400 11px ${tokens.font.mono};
`;
const SrOnly = styled.span`position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0);`;

interface Props {
  systemLabel: string;
  systemCount?: number;
  onSystemClick?: () => void;
  /** When provided, the pill opens a popover rendering this picker; `close` dismisses it. */
  renderSystemPicker?: (close: () => void) => React.ReactNode;
  onOpenExport: () => void;
  compact?: boolean;
}

export const TopBar: React.FC<Props> = ({
  systemLabel, systemCount, onSystemClick, renderSystemPicker, onOpenExport, compact = false,
}) => {
  const navigate = useNavigate();
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const { status, share } = useShare();
  const [pickerOpen, setPickerOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const shareText = status === "copied" ? "Copied" : status === "failed" ? "Couldn't copy" : "Share";
  const pillButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setPickerOpen(false), []);
  // Escape returns focus to the pill (a pick moves on to the canvas, so focus isn't forced back).
  const closeToPill = useCallback(() => { setPickerOpen(false); pillButtonRef.current?.focus(); }, []);

  // Move focus into the picker when it opens.
  useEffect(() => {
    if (!pickerOpen) return;
    const first = popoverRef.current?.querySelector<HTMLElement>(
      'input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();
  }, [pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeToPill(); };
    const onDown = (e: PointerEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [pickerOpen, close, closeToPill]);

  const onPill = () => {
    if (renderSystemPicker) setPickerOpen(o => !o);
    else onSystemClick?.();
  };

  return (
    <Bar $compact={compact}>
      <Side $compact={compact}>
        <Brand>
          <Mark $size={compact ? 32 : 24}><Icon name="all_inclusive" size={compact ? 18 : 16} /></Mark>
          {compact ? <span className="compact-name">Chaos Iterator</span> : "Chaos Iterator"}
        </Brand>
      </Side>

      <PillWrap ref={pillRef} $compact={compact}>
        <Pill ref={pillButtonRef} type="button" $compact={compact} onClick={onPill} aria-haspopup={renderSystemPicker ? "dialog" : undefined}
          aria-expanded={renderSystemPicker ? pickerOpen : undefined} aria-label={`${systemLabel} — change system`}>
          <span className="dot" />
          <span className="label">{systemLabel}</span>
          {!compact && systemCount !== undefined && <span className="count">{systemCount} systems</span>}
          <span className="chev"><Icon name="chevronDown" size={16} /></span>
        </Pill>
        {pickerOpen && renderSystemPicker && (
          <Popover ref={popoverRef} role="dialog" aria-label="Choose system">{renderSystemPicker(close)}</Popover>
        )}
      </PillWrap>

      <RightSide $compact={compact}>
        {!compact && (
          <ThemeSelect aria-label="Theme" value={currentTheme} onChange={e => setTheme(e.target.value)}>
            {availableThemes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </ThemeSelect>
        )}
        {!compact && (
          <GhostIcon type="button" aria-label="Help" title="Help & About" onClick={() => navigate("/info")}>
            <Icon name="help" size={20} />
          </GhostIcon>
        )}
        <ShareButton type="button" aria-label="Share" title="Copy link to this render" $compact={compact} $state={status} onClick={share}>
          <Icon name={status === "copied" ? "check" : status === "failed" ? "error" : "share"} size={16} />
          {!compact && <span>{shareText}</span>}
        </ShareButton>
        {!compact && (
          <ExportButton type="button" aria-label="Export" onClick={onOpenExport}>
            <Icon name="download" size={16} /> Export
          </ExportButton>
        )}
      </RightSide>

      {compact && status !== "idle" && <Toast data-visible-status $failed={status === "failed"}>{shareText}</Toast>}
      <SrOnly role="status" aria-live="polite">{status !== "idle" ? shareText : ""}</SrOnly>
    </Bar>
  );
};
