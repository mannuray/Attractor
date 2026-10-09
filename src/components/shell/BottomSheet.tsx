import React, { useRef } from "react";
import styled, { css } from "styled-components";
import { SheetAction, SheetState, SheetTab } from "../../lib/sheetState";
import { Icon } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

export const SHEET_PEEK_PX = 156;

const TABS: { id: SheetTab; label: string; icon: string }[] = [
  { id: "system", label: "System", icon: "hub" },
  { id: "params", label: "Params", icon: "tune" },
  { id: "color", label: "Color", icon: "palette" },
  { id: "export", label: "Export", icon: "file_download" },
];

const Sheet = styled.section<{ $expanded: boolean }>`
  position: absolute; left: 0; right: 0; bottom: 0; z-index: ${tokens.z.sheet};
  display: flex; flex-direction: column;
  box-shadow: 0 -20px 50px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
  transition: height 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  ${p => p.$expanded
    ? css`
      height: min(70vh, 592px);
      background: rgba(24, 27, 37, 0.95);
      border-top: 1px solid ${p.theme.hairline};
      border-radius: 28px 28px 0 0;
    `
    : css`
      height: ${SHEET_PEEK_PX}px;
      background: rgba(24, 27, 37, 0.9);
      border-top: 1px solid rgba(76, 215, 246, 0.25);
      border-radius: 16px 16px 0 0;
    `}
`;
const Handle = styled.button<{ $expanded: boolean }>`
  align-self: center; flex-shrink: 0; width: 72px; height: ${p => (p.$expanded ? "22px" : "16px")};
  margin-top: ${p => (p.$expanded ? "4px" : "2px")};
  border: none; background: transparent; cursor: grab; touch-action: none;
  &::after {
    content: ""; display: block; margin: 0 auto; border-radius: ${tokens.radius.full};
    width: ${p => (p.$expanded ? "48px" : "40px")}; height: ${p => (p.$expanded ? "6px" : "4px")};
    background: rgba(61, 73, 76, 0.6);
  }
`;
const PeekRow = styled.div`padding: 0 20px 8px;`;
const IconTabs = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin: 0 16px;
  padding: 4px 0 calc(4px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(61, 73, 76, 0.2);
`;
const IconTab = styled.button<{ $active: boolean }>`
  min-height: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  background: transparent; border: none; border-radius: 8px; cursor: pointer;
  color: ${p => (p.$active ? p.theme.primary : p.theme.textMid)};
  font: ${p => (p.$active ? 600 : 400)} 11px/0.875rem ${tokens.font.mono}; letter-spacing: -0.01em;
  .ico { position: relative; display: inline-flex; }
  .pip {
    position: absolute; top: -2px; right: -4px; width: 6px; height: 6px; border-radius: 50%;
    background: ${p => p.theme.primary}; box-shadow: ${p => p.theme.glowPrimary};
  }
  &:active { transform: scale(0.95); }
`;
const PillTabs = styled.div`
  display: flex; gap: 4px; padding: 4px 12px 8px; flex-shrink: 0;
  border-bottom: 1px solid rgba(61, 73, 76, 0.2);
`;
const PillTab = styled.button<{ $active: boolean }>`
  flex: 1; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border-radius: 8px; cursor: pointer;
  font: ${p => (p.$active ? 600 : 500)} 11px/0.875rem ${tokens.font.mono}; letter-spacing: 0.02em;
  background: ${p => (p.$active ? "rgba(76, 215, 246, 0.1)" : "transparent")};
  border: 1px solid ${p => (p.$active ? p.theme.primaryBorder : "transparent")};
  color: ${p => (p.$active ? p.theme.primary : p.theme.textMid)};
  box-shadow: ${p => (p.$active ? "0 0 12px -2px rgba(6, 182, 212, 0.35)" : "none")};
  &::before {
    content: ""; width: 6px; height: 6px; border-radius: 50%;
    display: ${p => (p.$active ? "block" : "none")}; background: ${p => p.theme.primary};
  }
`;
const Panel = styled.div`
  flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain;
  padding: 12px 12px 16px; display: flex; flex-direction: column; gap: 16px;
  scrollbar-width: none; &::-webkit-scrollbar { display: none; }
`;
const StickyActions = styled.div`
  flex-shrink: 0; padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(61, 73, 76, 0.2);
  background: rgba(24, 27, 37, 0.98);
`;

interface Props {
  state: SheetState;
  dispatch: React.Dispatch<SheetAction>;
  actionRow: React.ReactNode;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<Props> = ({ state, dispatch, actionRow, children }) => {
  const dragStartY = useRef<number | null>(null);
  // A swipe on the handle may also produce a click; skip that click so it doesn't undo the swipe.
  const swiped = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    swiped.current = false; // a new gesture never inherits a previous swipe
    dragStartY.current = e.clientY;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.clientY - dragStartY.current;
    dragStartY.current = null;
    if (!Number.isFinite(dy) || Math.abs(dy) <= 40) return;
    swiped.current = true;
    dispatch({ type: dy < 0 ? "expand" : "collapse" });
  };
  const onHandleClick = () => {
    if (swiped.current) { swiped.current = false; return; }
    dispatch({ type: "toggle" });
  };

  const handle = (
    <Handle type="button" $expanded={state.expanded} aria-label={state.expanded ? "Collapse panel" : "Expand panel"}
      aria-expanded={state.expanded} onClick={onHandleClick} onPointerDown={onPointerDown} onPointerUp={onPointerUp}
      onPointerCancel={() => { dragStartY.current = null; }} />
  );

  if (!state.expanded) {
    return (
      <Sheet $expanded={false} aria-label="Controls">
        {handle}
        <PeekRow>{actionRow}</PeekRow>
        <IconTabs role="tablist" aria-label="Control sections">
          {TABS.map(t => (
            <IconTab key={t.id} type="button" role="tab" aria-selected={false} $active={state.tab === t.id}
              onClick={() => dispatch({ type: "tapTab", tab: t.id })}>
              <span className="ico"><Icon name={t.icon} size={20} />{state.tab === t.id && <span className="pip" />}</span>
              {t.label}
            </IconTab>
          ))}
        </IconTabs>
      </Sheet>
    );
  }

  return (
    <Sheet $expanded aria-label="Controls">
      {handle}
      <PillTabs role="tablist" aria-label="Control sections">
        {TABS.map(t => (
          <PillTab key={t.id} type="button" role="tab" aria-selected={state.tab === t.id} $active={state.tab === t.id}
            onClick={() => dispatch({ type: "tapTab", tab: t.id })}>
            {t.label}
          </PillTab>
        ))}
      </PillTabs>
      <Panel role="tabpanel">{children}</Panel>
      <StickyActions>{actionRow}</StickyActions>
    </Sheet>
  );
};
