import { useEffect, useState } from "react";
import { tokens } from "../theme/tokens";

const QUERY = `(max-width: ${tokens.breakpoint.mobileMax}px)`;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    const onChange = (e: { matches: boolean }) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
