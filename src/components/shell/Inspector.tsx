import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ShellProps } from "./types";
import { RenderPanel, ColorPanel, FxPanel, StatsReadout } from "../panels";
import { useShare } from "../../hooks/useShare";
import { Icon } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

type TabId = "params" | "look" | "output";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "params", label: "Parameters", icon: "tune" },
  { id: "look", label: "Look", icon: "palette" },
  { id: "output", label: "Output", icon: "download" },
];

const Aside = styled.aside<{ $collapsed: boolean }>`
  width: ${p => (p.$collapsed ? "56px" : "320px")};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: ${p => p.theme.glass1};
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid ${p => p.theme.hairline};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: ${tokens.z.panel};
`;
const Top = styled.div`padding: 12px 12px 0; display: flex; flex-direction: column; gap: 12px; flex-shrink: 0;`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding-bottom: 8px; border-bottom: 1px solid rgba(61, 73, 76, 0.2);
  .id { display: flex; align-items: center; gap: 8px; min-width: 0; color: ${p => p.theme.primary}; }
  h2 { margin: 0; font: 600 18px/1.5rem ${tokens.font.ui}; letter-spacing: -0.015em; color: ${p => p.theme.primary}; }
  p { margin: 0; font: 400 11px/0.875rem ${tokens.font.mono}; color: ${p => p.theme.textLow};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;
const SmallIconButton = styled.button`
  display: grid; place-items: center; width: 28px; height: 28px; border-radius: 4px; flex-shrink: 0;
  background: transparent; border: none; cursor: pointer; color: ${p => p.theme.textMid};
  &:hover { color: ${p => p.theme.primary}; background: ${p => p.theme.surfaceHigh}; }
`;
const Tabs = styled.div<{ $collapsed: boolean }>`
  display: grid;
  grid-template-columns: ${p => (p.$collapsed ? "1fr" : "repeat(3, 1fr)")};
  gap: 4px; padding: 4px;
  background: rgba(11, 14, 23, 0.8);
  border: 1px solid rgba(61, 73, 76, 0.2);
  border-radius: 8px;
`;
const TabButton = styled.button<{ $active: boolean }>`
  display: grid; place-items: center; height: 28px; border-radius: 4px; cursor: pointer;
  background: ${p => (p.$active ? p.theme.primarySoft : "transparent")};
  border: 1px solid ${p => (p.$active ? p.theme.primaryBorder : "transparent")};
  color: ${p => (p.$active ? p.theme.primary : p.theme.textMid)};
  box-shadow: ${p => (p.$active ? p.theme.glowPrimary : "none")};
  &:hover { color: ${p => p.theme.primary}; background: ${p => (p.$active ? p.theme.primarySoft : p.theme.surfaceHigh)}; }
`;
const Body = styled.div`
  flex: 1; min-height: 0; overflow-y: auto; padding: 16px 12px;
  display: flex; flex-direction: column; gap: 18px;
`;
const SystemRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 8px 10px; border-radius: 10px;
  background: ${p => p.theme.surfaceLowest}; border: 1px solid ${p => p.theme.hairline};
  .k { font: 400 11px/0.875rem ${tokens.font.mono}; letter-spacing: 0.06em; text-transform: uppercase; color: ${p => p.theme.textMid}; }
  h3 { margin: 2px 0 0; font: 600 15px/1.25rem ${tokens.font.ui}; color: ${p => p.theme.textHigh}; }
  button {
    display: inline-flex; align-items: center; gap: 2px; padding: 4px 8px; border-radius: 6px; cursor: pointer;
    background: transparent; border: 1px solid ${p => p.theme.primaryBorder};
    color: ${p => p.theme.primary}; font: 500 12px/1rem ${tokens.font.ui};
    &:hover { background: ${p => p.theme.primarySoft}; }
  }
`;
const Divider = styled.div`height: 1px; background: ${p => p.theme.hairline};`;
const OutputActions = styled.div`
  display: flex; flex-direction: column; gap: 8px;
  button {
    width: 100%; height: 36px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    border-radius: 8px; cursor: pointer; font: 500 13px/1.25rem ${tokens.font.ui};
  }
  .primary { border: none; background: ${p => p.theme.primaryContainer}; color: ${p => p.theme.onPrimary}; font-weight: 600; box-shadow: ${p => p.theme.glowPrimary}; }
  .primary:hover { filter: brightness(1.1); }
  .secondary { background: transparent; border: 1px solid ${p => p.theme.hairlineStrong}; color: ${p => p.theme.textHigh}; }
  .secondary:hover { background: ${p => p.theme.surfaceHigh}; }
  .secondary[data-state="failed"] { border-color: ${p => p.theme.danger}; color: ${p => p.theme.danger}; }
  .secondary[data-state="copied"] { border-color: ${p => p.theme.primaryBorder}; color: ${p => p.theme.primary}; }
`;
const Toast = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 6px 8px 6px 10px; border-radius: 8px;
  background: ${p => p.theme.surfaceHigh}; border: 1px solid ${p => p.theme.hairlineStrong};
  font: 400 12px/1rem ${tokens.font.ui}; color: ${p => p.theme.textHigh};
  button {
    background: none; border: none; cursor: pointer; padding: 2px 6px; border-radius: 4px;
    font: 600 12px/1rem ${tokens.font.ui}; color: ${p => p.theme.primary};
    &:hover { background: ${p => p.theme.primarySoft}; }
  }
`;
const Footer = styled.div`
  flex-shrink: 0; padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 8px;
  border-top: 1px solid ${p => p.theme.hairline};
`;
const Actions = styled.div`display: flex; gap: 8px;`;
const ResetButton = styled.button`
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  height: 32px; border-radius: 8px; cursor: pointer;
  background: ${p => p.theme.surfaceHigh}; border: 1px solid ${p => p.theme.hairlineStrong};
  color: ${p => p.theme.textHigh}; font: 400 13px/1.25rem ${tokens.font.ui};
  &:hover { background: #363943; }
`;
const RunButton = styled.button`
  flex: 2; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 32px; border-radius: 8px; cursor: pointer; border: none;
  background: ${p => p.theme.primaryContainer}; color: ${p => p.theme.onPrimary};
  font: 600 13px/1.25rem ${tokens.font.ui}; box-shadow: ${p => p.theme.glowPrimary};
  &:hover { background: ${p => p.theme.primary}; }
`;

type Props = ShellProps & { collapsed: boolean; onToggleCollapse: () => void };

export const Inspector: React.FC<Props> = (p) => {
  const [tab, setTab] = useState<TabId>("params");
  const { status: shareStatus, share } = useShare();
  const [undoVisible, setUndoVisible] = useState(false);
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});
  const undoTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(undoTimer.current), []);

  const select = (id: TabId, focus = false) => {
    if (p.collapsed) p.onToggleCollapse();
    setTab(id);
    if (focus) tabRefs.current[id]?.focus();
  };
  const onTabKeyDown = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex(t => t.id === tab);
    const next =
      e.key === "ArrowRight" ? (i + 1) % TABS.length :
      e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length :
      e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    select(TABS[next].id, true);
  };

  const reset = () => {
    p.onResetFractalView();
    if (!p.onUndoReset) return;
    setUndoVisible(true);
    window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndoVisible(false), 6000);
  };
  const undo = () => {
    window.clearTimeout(undoTimer.current);
    setUndoVisible(false);
    p.onUndoReset?.();
  };

  const runLabel = p.isFractalType ? "Render" : p.iterating ? "Pause" : "Run";
  const panelId = "inspector-panel";

  return (
    <Aside $collapsed={p.collapsed} aria-label="Inspector">
      <Top>
        <Header>
          {!p.collapsed && (
            <div className="id">
              <Icon name="grain" size={20} />
              <div style={{ minWidth: 0 }}>
                <h2>Inspector</h2>
                <p>{p.systemLabel}</p>
              </div>
            </div>
          )}
          <SmallIconButton type="button" aria-label={p.collapsed ? "Expand inspector" : "Collapse inspector"}
            title={p.collapsed ? "Expand inspector" : "Collapse inspector"} onClick={p.onToggleCollapse}>
            <Icon name={p.collapsed ? "left_panel_open" : "right_panel_close"} size={18} />
          </SmallIconButton>
        </Header>
        <Tabs $collapsed={p.collapsed} role="tablist" aria-label="Inspector sections" aria-orientation={p.collapsed ? "vertical" : "horizontal"}>
          {TABS.map(t => (
            <TabButton key={t.id} ref={el => { tabRefs.current[t.id] = el; }} type="button" role="tab"
              id={`inspector-tab-${t.id}`} aria-label={t.label} title={t.label}
              aria-selected={tab === t.id} aria-controls={p.collapsed ? undefined : panelId}
              tabIndex={tab === t.id ? 0 : -1} $active={!p.collapsed && tab === t.id}
              onClick={() => select(t.id)} onKeyDown={onTabKeyDown}>
              <Icon name={t.icon} size={16} />
            </TabButton>
          ))}
        </Tabs>
      </Top>

      {!p.collapsed && (
        <>
          <Body id={panelId} role="tabpanel" aria-labelledby={`inspector-tab-${tab}`} tabIndex={0}>
            {tab === "params" && (
              <>
                <SystemRow>
                  <div>
                    <div className="k">System</div>
                    <h3>{p.systemLabel}</h3>
                  </div>
                  {p.onChangeSystem && (
                    <button type="button" aria-label="Change system" onClick={p.onChangeSystem}>
                      Change <Icon name="chevronDown" size={14} />
                    </button>
                  )}
                </SystemRow>
                {p.controls}
              </>
            )}
            {tab === "look" && (
              <>
                <ColorPanel paletteData={p.paletteData} bgColor={p.bgColor}
                  onBgModeChange={p.onBgModeChange} onOpenPalette={p.onOpenPalette} />
                <Divider />
                <FxPanel fx={p.fx} onChange={p.onFxChange} />
              </>
            )}
            {tab === "output" && (
              <>
                <RenderPanel canvasSize={p.canvasSize} onCanvasSizeChange={p.onCanvasSizeChange}
                  oversampling={p.oversampling} onOversamplingChange={p.onOversamplingChange} />
                <OutputActions>
                  <button type="button" className="primary" aria-label="Export image" onClick={p.onOpenExport}>
                    <Icon name="download" size={16} /> Export image
                  </button>
                  <button type="button" className="secondary" aria-label="Copy link" data-state={shareStatus} onClick={share}>
                    <Icon name={shareStatus === "copied" ? "check" : shareStatus === "failed" ? "error" : "link"} size={16} />
                    {shareStatus === "copied" ? "Link copied" : shareStatus === "failed" ? "Couldn't copy" : "Copy link"}
                  </button>
                </OutputActions>
              </>
            )}
          </Body>
          <Footer>
            <StatsReadout statsRef={p.statsRef} running={p.iterating} rendering={p.rendering}
              isFractal={p.isFractalType} maxIter={p.maxIter} renderProgress={p.renderProgress} />
            {undoVisible && (
              <Toast role="status">
                <span>Parameters reset</span>
                <button type="button" aria-label="Undo reset" onClick={undo}>Undo</button>
              </Toast>
            )}
            <Actions>
              <ResetButton type="button" aria-label="Reset parameters" title="Reset parameters to defaults" onClick={reset}>
                <Icon name="restart_alt" size={16} /> Reset
              </ResetButton>
              <RunButton type="button" aria-label={runLabel} onClick={p.onToggleIteration}>
                <Icon name={p.iterating && !p.isFractalType ? "pause_circle" : "play_circle"} size={16} /> {runLabel}
              </RunButton>
            </Actions>
          </Footer>
        </>
      )}
    </Aside>
  );
};
