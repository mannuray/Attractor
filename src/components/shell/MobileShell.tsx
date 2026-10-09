import React, { useReducer } from "react";
import styled from "styled-components";
import { ShellProps } from "./types";
import { TopBar } from "./TopBar";
import { CanvasToolbar } from "./CanvasToolbar";
import { BottomSheet, SHEET_PEEK_PX } from "./BottomSheet";
import { SystemPanel, RenderPanel, ColorPanel, FxPanel, StatsReadout } from "../panels";
import { IconButton } from "../ui/IconButton";
import { Icon } from "../ui/Icon";
import { sheetReducer, initialSheet } from "../../lib/sheetState";
import { tokens } from "../../theme/tokens";

const Page = styled.div`
  position: fixed; inset: 0; overflow: hidden;
  background: ${p => p.theme.canvasBg}; color: ${p => p.theme.textHigh}; font-family: ${tokens.font.ui};
`;
const Stage = styled.div`position: absolute; top: 0; left: 0; right: 0; bottom: ${SHEET_PEEK_PX}px; display: flex;`;
const Overlay = styled.div`position: absolute; top: 0; left: 0; right: 0; z-index: ${tokens.z.toolbar}; pointer-events: none; & > * { pointer-events: auto; }`;
const StatsChip = styled.div`
  margin: 8px auto 0; width: fit-content; padding: 6px 12px; border-radius: ${tokens.radius.full};
  background: ${p => p.theme.glass1}; border: 1px solid ${p => p.theme.hairline};
`;
const Section = styled.div`margin-bottom: 20px;`;
const Title = styled.h2`margin: 0 0 12px; font: 600 18px ${tokens.font.ui}; color: ${p => p.theme.textHigh};`;
const ExportButton = styled(IconButton)`width: 100%; height: 48px;`;

export const MobileShell: React.FC<ShellProps> = (p) => {
  const [sheet, dispatch] = useReducer(sheetReducer, initialSheet);
  const { canvas, ...rest } = p;

  return (
    <Page>
      <Stage onPointerDown={() => sheet.expanded && dispatch({ type: "collapse" })}>{canvas}</Stage>
      <Overlay>
        <TopBar compact systemLabel={p.systemLabel} onOpenExport={p.onOpenExport}
          onSystemClick={() => dispatch({ type: "tapTab", tab: "system" })} />
        <StatsChip>
          <StatsReadout compact statsRef={p.statsRef} running={p.iterating} rendering={p.rendering}
            isFractal={p.isFractalType} maxIter={p.maxIter} />
        </StatsChip>
      </Overlay>
      <BottomSheet state={sheet} dispatch={dispatch} actionRow={<CanvasToolbar {...rest} variant="mobile" />}>
        {sheet.tab === "system" && (
          <SystemPanel value={p.attractorType} onChange={p.onAttractorTypeChange}
            onPicked={() => dispatch({ type: "tapTab", tab: "params" })} />
        )}
        {sheet.tab === "params" && (<><Title>{p.systemLabel}</Title>{p.controls}</>)}
        {sheet.tab === "color" && (
          <>
            <Section><ColorPanel paletteData={p.paletteData} bgColor={p.bgColor} onBgModeChange={p.onBgModeChange} onOpenPalette={p.onOpenPalette} /></Section>
            <Section><FxPanel fx={p.fx} onChange={p.onFxChange} /></Section>
          </>
        )}
        {sheet.tab === "export" && (
          <>
            <Section><RenderPanel canvasSize={p.canvasSize} onCanvasSizeChange={p.onCanvasSizeChange}
              oversampling={p.oversampling} onOversamplingChange={p.onOversamplingChange} /></Section>
            <ExportButton label="Export image" variant="primary" onClick={p.onOpenExport}>
              <Icon name="download" size={18} /> Export image
            </ExportButton>
          </>
        )}
      </BottomSheet>
    </Page>
  );
};
