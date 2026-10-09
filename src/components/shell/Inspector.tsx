import React from "react";
import styled from "styled-components";
import { ShellProps } from "./types";
import { SystemPanel, RenderPanel, ColorPanel, FxPanel, StatsReadout } from "../panels";
import { IconButton } from "../ui/IconButton";
import { Icon, IconName } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

export type InspectorTab = "system" | "params" | "render" | "color" | "fx";

const TABS: { id: InspectorTab; label: string; icon: IconName }[] = [
  { id: "system", label: "System", icon: "layers" },
  { id: "params", label: "Parameters", icon: "sliders" },
  { id: "render", label: "Render", icon: "image" },
  { id: "color", label: "Color", icon: "palette" },
  { id: "fx", label: "Effects", icon: "wand" },
];

const Aside = styled.aside<{ $collapsed: boolean }>`
  width: ${p => (p.$collapsed ? "56px" : "320px")};
  flex-shrink: 0;
  display: flex; flex-direction: column;
  background: ${p => p.theme.glass1};
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border-left: 1px solid ${p => p.theme.hairline};
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: ${tokens.z.panel};
  min-height: 0;
`;
const TabRow = styled.div<{ $collapsed: boolean }>`
  display: flex; flex-direction: ${p => (p.$collapsed ? "column" : "row")};
  gap: 4px; padding: 10px; border-bottom: 1px solid ${p => p.theme.hairline};
`;
const Body = styled.div`
  flex: 1; overflow-y: auto; padding: 16px; min-height: 0;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${p => p.theme.hairlineStrong}; border-radius: 2px; }
`;
const Footer = styled.div`padding: 12px 16px; border-top: 1px solid ${p => p.theme.hairline};`;
const Title = styled.div`
  display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px;
  h2 { margin: 0; font: 600 16px ${tokens.font.ui}; color: ${p => p.theme.textHigh}; }
`;

type Props = ShellProps & {
  collapsed: boolean; onToggleCollapse: () => void;
  tab: InspectorTab; onTabChange: (t: InspectorTab) => void;
};

export const Inspector: React.FC<Props> = (p) => {
  const tabButtons = TABS.map(t => (
    <IconButton key={t.id} role="tab" aria-selected={p.tab === t.id} label={t.label} size="sm"
      active={!p.collapsed && p.tab === t.id}
      onClick={() => { if (p.collapsed) p.onToggleCollapse(); p.onTabChange(t.id); }}>
      <Icon name={t.icon} size={16} />
    </IconButton>
  ));

  return (
    <Aside $collapsed={p.collapsed} aria-label="Inspector">
      <TabRow role="tablist" aria-label="Inspector sections" $collapsed={p.collapsed}>
        {tabButtons}
        <span style={{ flex: 1 }} />
        <IconButton label={p.collapsed ? "Expand inspector" : "Collapse inspector"} size="sm" onClick={p.onToggleCollapse}>
          <Icon name={p.collapsed ? "chevronLeft" : "chevronRight"} size={16} />
        </IconButton>
      </TabRow>

      {!p.collapsed && (
        <>
          <Body role="tabpanel">
            {p.tab === "system" && <SystemPanel value={p.attractorType} onChange={p.onAttractorTypeChange} />}
            {p.tab === "params" && (
              <>
                <Title><h2>{p.systemLabel}</h2></Title>
                {p.controls}
              </>
            )}
            {p.tab === "render" && <RenderPanel canvasSize={p.canvasSize} onCanvasSizeChange={p.onCanvasSizeChange}
              oversampling={p.oversampling} onOversamplingChange={p.onOversamplingChange} />}
            {p.tab === "color" && <ColorPanel paletteData={p.paletteData} bgColor={p.bgColor}
              onBgModeChange={p.onBgModeChange} onOpenPalette={p.onOpenPalette} />}
            {p.tab === "fx" && <FxPanel fx={p.fx} onChange={p.onFxChange} />}
          </Body>
          <Footer>
            <StatsReadout statsRef={p.statsRef} running={p.iterating} rendering={p.rendering}
              isFractal={p.isFractalType} maxIter={p.maxIter} />
          </Footer>
        </>
      )}
    </Aside>
  );
};
