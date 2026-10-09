import React, { useEffect, useReducer, useRef } from "react";
import styled from "styled-components";
import { ShellProps } from "./types";
import { TopBar } from "./TopBar";
import { CanvasToolbar } from "./CanvasToolbar";
import { BottomSheet, SHEET_PEEK_PX } from "./BottomSheet";
import { SystemPanel, RenderPanel, ColorPanel, FxPanel, StatsReadout } from "../panels";
import { Icon } from "../ui/Icon";
import { sheetReducer, initialSheet } from "../../lib/sheetState";
import { tokens } from "../../theme/tokens";

const Page = styled.div`
  position: fixed; inset: 0; overflow: hidden;
  background: ${p => p.theme.canvasBg}; color: ${p => p.theme.textHigh}; font-family: ${tokens.font.ui};
`;
const Stage = styled.div`position: absolute; top: 0; left: 0; right: 0; bottom: ${SHEET_PEEK_PX - 16}px; display: flex;`;
const Overlay = styled.div`
  position: absolute; top: 0; left: 0; right: 0; z-index: ${tokens.z.toolbar};
  pointer-events: none; & > * { pointer-events: auto; }
`;
const StatsChip = styled.div`
  margin: 8px auto 0; width: fit-content; padding: 4px 14px; border-radius: ${tokens.radius.full};
  display: flex; align-items: center; gap: 8px; pointer-events: none !important;
  background: rgba(11, 14, 23, 0.8); border: 1px solid rgba(76, 215, 246, 0.25);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 15px -3px rgba(11, 14, 23, 0.8);
  .dot { width: 6px; height: 6px; border-radius: 50%; background: #2fd9f4; box-shadow: ${p => p.theme.glowPrimary}; }
  dd { color: ${p => p.theme.primary} !important; }
`;
const SheetHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  h2 { margin: 0; font: 700 18px/1.5rem ${tokens.font.ui}; letter-spacing: -0.015em; color: ${p => p.theme.textHigh}; }
  p { margin: 0; font: 400 11px/0.875rem ${tokens.font.mono}; color: ${p => p.theme.textMid}; }
`;
const ExportButton = styled.button`
  width: 100%; min-height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border-radius: 12px; border: none; cursor: pointer;
  background: ${p => p.theme.primaryContainer}; color: ${p => p.theme.onPrimary};
  font: 600 15px/1.375rem ${tokens.font.ui}; box-shadow: ${p => p.theme.glowPrimary};
`;

export const MobileShell: React.FC<ShellProps> = (p) => {
  const [sheet, dispatch] = useReducer(sheetReducer, initialSheet);
  const stageRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef(sheet.expanded);
  expandedRef.current = sheet.expanded;
  const { canvas, ...rest } = p;

  // The canvas is portaled (see ResponsiveShell), so React pointer events from it don't bubble
  // through this component tree. Native DOM events do, because the canvas host is attached inside Stage.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onDown = () => { if (expandedRef.current) dispatch({ type: "collapse" }); };
    el.addEventListener("pointerdown", onDown);
    return () => el.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <Page>
      <Stage ref={stageRef}>{canvas}</Stage>
      <Overlay>
        <TopBar compact systemLabel={p.systemLabel} onOpenExport={p.onOpenExport}
          onSystemClick={() => dispatch({ type: "tapTab", tab: "system" })} />
        <StatsChip>
          <span className="dot" />
          <StatsReadout compact statsRef={p.statsRef} running={p.iterating} rendering={p.rendering}
            isFractal={p.isFractalType} maxIter={p.maxIter} />
        </StatsChip>
      </Overlay>
      <BottomSheet state={sheet} dispatch={dispatch} actionRow={<CanvasToolbar {...rest} variant="mobile" />}>
        {sheet.tab === "system" && (
          <SystemPanel value={p.attractorType} onChange={p.onAttractorTypeChange}
            onPicked={() => dispatch({ type: "tapTab", tab: "params" })} />
        )}
        {sheet.tab === "params" && (
          <>
            <SheetHeader><div><h2>{p.systemLabel}</h2><p>Parameters</p></div></SheetHeader>
            {p.controls}
          </>
        )}
        {sheet.tab === "color" && (
          <>
            <ColorPanel paletteData={p.paletteData} bgColor={p.bgColor} onBgModeChange={p.onBgModeChange} onOpenPalette={p.onOpenPalette} />
            <FxPanel fx={p.fx} onChange={p.onFxChange} />
          </>
        )}
        {sheet.tab === "export" && (
          <>
            <RenderPanel canvasSize={p.canvasSize} onCanvasSizeChange={p.onCanvasSizeChange}
              oversampling={p.oversampling} onOversamplingChange={p.onOversamplingChange} />
            <ExportButton type="button" aria-label="Export image" onClick={p.onOpenExport}>
              <Icon name="download" size={18} /> Export image
            </ExportButton>
          </>
        )}
      </BottomSheet>
    </Page>
  );
};
