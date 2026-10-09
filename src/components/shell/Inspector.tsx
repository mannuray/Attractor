import React, { useRef, useState } from "react";
import styled from "styled-components";
import { ShellProps } from "./types";
import { SystemPanel, RenderPanel, ColorPanel, FxPanel, StatsReadout } from "../panels";
import { Icon } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

type SectionId = "system" | "params" | "render" | "color" | "fx";

const JUMPS: { id: SectionId; label: string; icon: string }[] = [
  { id: "system", label: "System", icon: "category" },
  { id: "params", label: "Parameters", icon: "grain" },
  { id: "render", label: "Render", icon: "aspect_ratio" },
  { id: "color", label: "Color", icon: "palette" },
  { id: "fx", label: "Effects", icon: "auto_fix_high" },
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
const Jumps = styled.nav<{ $collapsed: boolean }>`
  display: grid;
  grid-template-columns: ${p => (p.$collapsed ? "1fr" : "repeat(5, 1fr)")};
  gap: 4px; padding: 4px;
  background: rgba(11, 14, 23, 0.8);
  border: 1px solid rgba(61, 73, 76, 0.2);
  border-radius: 8px;
`;
const JumpButton = styled.button<{ $active: boolean }>`
  display: grid; place-items: center; height: 28px; border-radius: 4px; cursor: pointer;
  background: ${p => (p.$active ? p.theme.primarySoft : "transparent")};
  border: 1px solid ${p => (p.$active ? p.theme.primaryBorder : "transparent")};
  color: ${p => (p.$active ? p.theme.primary : p.theme.textMid)};
  box-shadow: ${p => (p.$active ? p.theme.glowPrimary : "none")};
  &:hover { color: ${p => p.theme.primary}; background: ${p => (p.$active ? p.theme.primarySoft : p.theme.surfaceHigh)}; }
`;
const Body = styled.div`
  position: relative; /* sections' offsetTop is measured from here for scroll tracking */
  flex: 1; min-height: 0; overflow-y: auto; padding: 16px 12px;
  display: flex; flex-direction: column; gap: 18px;
`;
const Section = styled.section`
  scroll-margin-top: 8px;
  &[data-divider] { padding-top: 14px; border-top: 1px solid rgba(61, 73, 76, 0.2); }
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
  const [current, setCurrent] = useState<SectionId>("params");
  const refs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});

  const jump = (id: SectionId) => {
    setCurrent(id);
    const scroll = () => refs.current[id]?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    if (p.collapsed) {
      p.onToggleCollapse();
      requestAnimationFrame(scroll); // sections mount on expand; scroll next frame
    } else {
      scroll();
    }
  };

  // Highlight the last section whose top has scrolled past the panel's top edge.
  const onBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop + 40;
    let next: SectionId = JUMPS[0].id;
    for (const j of JUMPS) {
      const el = refs.current[j.id];
      if (el && el.offsetTop <= y) next = j.id;
    }
    setCurrent(c => (c === next ? c : next));
  };

  const section = (id: SectionId, children: React.ReactNode, divider = false) => (
    <Section ref={el => { refs.current[id] = el; }} aria-label={JUMPS.find(j => j.id === id)!.label}
      data-divider={divider ? "" : undefined}>
      {children}
    </Section>
  );

  const runLabel = p.isFractalType ? "Render" : p.iterating ? "Pause" : "Run";

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
        <Jumps $collapsed={p.collapsed} aria-label="Inspector sections">
          {JUMPS.map(j => (
            <JumpButton key={j.id} type="button" aria-label={`Jump to ${j.label}`} title={j.label}
              aria-current={current === j.id ? "true" : undefined} $active={current === j.id} onClick={() => jump(j.id)}>
              <Icon name={j.icon} size={16} />
            </JumpButton>
          ))}
        </Jumps>
      </Top>

      {!p.collapsed && (
        <>
          <Body data-testid="inspector-body" onScroll={onBodyScroll}>
            {section("system", <SystemPanel value={p.attractorType} onChange={p.onAttractorTypeChange} showSearch={false} listMaxHeight={136} />)}
            {section("params", p.controls)}
            {section("render", <RenderPanel canvasSize={p.canvasSize} onCanvasSizeChange={p.onCanvasSizeChange}
              oversampling={p.oversampling} onOversamplingChange={p.onOversamplingChange} />)}
            {section("color", <ColorPanel paletteData={p.paletteData} bgColor={p.bgColor}
              onBgModeChange={p.onBgModeChange} onOpenPalette={p.onOpenPalette} />)}
            {section("fx", <FxPanel fx={p.fx} onChange={p.onFxChange} />, true)}
          </Body>
          <Footer>
            <StatsReadout statsRef={p.statsRef} running={p.iterating} rendering={p.rendering}
              isFractal={p.isFractalType} maxIter={p.maxIter} />
            <Actions>
              <ResetButton type="button" aria-label="Reset parameters" title="Reset parameters to defaults" onClick={p.onResetFractalView}>
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
