import React from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { DesktopShell } from "./DesktopShell";
import { MobileShell } from "./MobileShell";
import { ShellProps } from "./types";

export const ResponsiveShell: React.FC<ShellProps> = (props) =>
  useIsMobile() ? <MobileShell {...props} /> : <DesktopShell {...props} />;
