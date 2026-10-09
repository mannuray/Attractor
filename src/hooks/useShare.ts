import { useCallback, useEffect, useRef, useState } from "react";

export type ShareStatus = "idle" | "copied" | "failed";

export function useShare(resetMs = 2000) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const share = useCallback(async () => {
    let next: ShareStatus = "failed";
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        next = "copied";
      }
    } catch {
      next = "failed";
    }
    setStatus(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), resetMs);
  }, [resetMs]);

  return { status, share };
}
