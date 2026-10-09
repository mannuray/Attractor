import React, { useRef } from "react";
import styled from "styled-components";
import { SheetAction, SheetState, SheetTab } from "../../lib/sheetState";
import { Icon, IconName } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

export const SHEET_PEEK_PX = 148;

const TABS: { id: SheetTab; label: string; icon: IconName }[] = [
  { id: "system", label: "System", icon: "layers" },
  { id: "params", label: "Params", icon: "sliders" },
  { id: "color", label: "Color", icon: "palette" },
  { id: "export", label: "Export", icon: "download" },
];

const Sheet = styled.section<{ $expanded: boolean }>`
  position: absolute; left: 0; right: 0; bottom: 0; z-index: ${tokens.z.sheet};
  height: ${p => (p.$expanded ? "68vh" : `${SHEET_PEEK_PX}px`)};
  padding-bottom: env(safe-area-inset-bottom);
  display: flex; flex-direction: column;
  background: ${p => p.theme.glass2};
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid ${p => p.theme.hairlineStrong};
  border-radius: 20px 20px 0 0;
  transition: height 0.28s cubic-bezier(0.16, 1, 0.3, 1);
`;
const Handle = styled.button`
  align-self: center; width: 64px; height: 24px; border: none; background: transparent; cursor: grab;
  touch-action: none;
  &::after { content: ""; display: block; margin: 0 auto; width: 40px; height: 4px; border-radius: 2px; background: ${p => p.theme.hairlineStrong}; }
`;
const ActionRow = styled.div`padding: 0 16px 8px;`;
const Tabs = styled.div`
  order: 3; display: grid; grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid ${p => p.theme.hairline};
`;
const Tab = styled.button<{ $active: boolean }>`
  min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  background: transparent; border: none; cursor: pointer;
  color: ${p => (p.$active ? p.theme.primary : p.theme.textMid)};
  font: 500 11px ${tokens.font.mono};
`;
const Panel = styled.div`order: 2; flex: 1; overflow-y: auto; padding: 8px 16px 16px; min-height: 0; overscroll-behavior: contain;`;

interface Props {
  state: SheetState;
  dispatch: React.Dispatch<SheetAction>;
  actionRow: React.ReactNode;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<Props> = ({ state, dispatch, actionRow, children }) => {
  const dragStartY = useRef<number | null>(null);
  // A swipe on the handle also produces a click; skip that click so it doesn't undo the swipe.
  const swiped = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => { dragStartY.current = e.clientY; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.clientY - dragStartY.current;
    dragStartY.current = null;
    if (Math.abs(dy) <= 40) return;
    swiped.current = true;
    dispatch({ type: dy < 0 ? "expand" : "collapse" });
  };
  const onHandleClick = () => {
    if (swiped.current) { swiped.current = false; return; }
    dispatch({ type: "toggle" });
  };

  return (
    <Sheet $expanded={state.expanded} aria-label="Controls">
      <Handle type="button" aria-label={state.expanded ? "Collapse panel" : "Expand panel"}
        aria-expanded={state.expanded}
        onClick={onHandleClick} onPointerDown={onPointerDown} onPointerUp={onPointerUp} />
      <ActionRow>{actionRow}</ActionRow>
      {state.expanded && <Panel role="tabpanel">{children}</Panel>}
      <Tabs role="tablist" aria-label="Control sections">
        {TABS.map(t => (
          <Tab key={t.id} type="button" role="tab" aria-selected={state.expanded && state.tab === t.id}
            $active={state.tab === t.id} onClick={() => dispatch({ type: "tapTab", tab: t.id })}>
            <Icon name={t.icon} size={20} />{t.label}
          </Tab>
        ))}
      </Tabs>
    </Sheet>
  );
};
