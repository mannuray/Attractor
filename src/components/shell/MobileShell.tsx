import React from "react";
import { DesktopShell } from "./DesktopShell";
import { ShellProps } from "./types";
export const MobileShell: React.FC<ShellProps> = (p) => <DesktopShell {...p} />;
