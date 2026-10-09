import React, { useState } from "react";
import styled from "styled-components";
import { ShellProps } from "./types";
import { TopBar } from "./TopBar";
import { Inspector } from "./Inspector";
import { CanvasToolbar } from "./CanvasToolbar";
import { tokens } from "../../theme/tokens";
import { registry } from "../../attractors/registry";
import { SystemPanel } from "../panels";

const Page = styled.div`
  display: grid; grid-template-rows: auto 1fr; width: 100vw; height: 100vh; overflow: hidden;
  background: ${p => p.theme.canvasBg}; color: ${p => p.theme.textHigh}; font-family: ${tokens.font.ui};
`;
const Row = styled.div`display: flex; min-height: 0;`;
const Stage = styled.main`flex: 1; min-width: 0; position: relative; display: flex;`;
const ToolbarDock = styled.div`
  position: absolute; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: ${tokens.z.toolbar};
`;

export const DesktopShell: React.FC<ShellProps> = (p) => {
  const [collapsed, setCollapsed] = useState(false);

  const { canvas, ...rest } = p;
  return (
    <Page>
      <TopBar systemLabel={p.systemLabel} systemCount={registry.getAll().length} onOpenExport={p.onOpenExport}
        renderSystemPicker={(close) => (
          <SystemPanel value={p.attractorType} onChange={p.onAttractorTypeChange} onPicked={close} />
        )} />
      <Row>
        <Stage>
          {canvas}
          <ToolbarDock>
            <CanvasToolbar {...rest} />
          </ToolbarDock>
        </Stage>
        <Inspector {...p} collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />
      </Row>
    </Page>
  );
};
