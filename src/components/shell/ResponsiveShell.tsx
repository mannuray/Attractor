import React, { useLayoutEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { useIsMobile } from "../../hooks/useIsMobile";
import { DesktopShell } from "./DesktopShell";
import { MobileShell } from "./MobileShell";
import { ShellProps } from "./types";

const Slot = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
`;

// Attaches the persistent canvas host node into whichever shell is mounted.
const CanvasSlot: React.FC<{ host: HTMLElement }> = ({ host }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const slot = ref.current;
    if (!slot) return;
    slot.appendChild(host);
    return () => {
      if (host.parentNode === slot) slot.removeChild(host);
    };
  }, [host]);
  return <Slot ref={ref} />;
};

export const ResponsiveShell: React.FC<ShellProps> = ({ canvas, ...rest }) => {
  const isMobile = useIsMobile();

  // The canvas is handed to a worker via transferControlToOffscreen, so it must never
  // remount. It is rendered once, at a fixed tree position, into a detached host node
  // that each shell attaches into its own layout.
  const host = useMemo(() => {
    const el = document.createElement("div");
    el.style.display = "contents";
    return el;
  }, []);

  const shellProps: ShellProps = { ...rest, canvas: <CanvasSlot host={host} /> };

  return (
    <>
      {createPortal(canvas, host)}
      {isMobile ? <MobileShell {...shellProps} /> : <DesktopShell {...shellProps} />}
    </>
  );
};
