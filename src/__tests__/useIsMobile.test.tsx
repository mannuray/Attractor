import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "../hooks/useIsMobile";

type Listener = (e: { matches: boolean }) => void;

function mockMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners: Listener[] = [];
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    get matches() { return matches; },
    media: query,
    addEventListener: (_: string, l: Listener) => listeners.push(l),
    removeEventListener: (_: string, l: Listener) => listeners.splice(listeners.indexOf(l), 1),
  })) as any;
  return (next: boolean) => { matches = next; listeners.forEach(l => l({ matches })); };
}

describe("useIsMobile", () => {
  it("uses the 1023px max-width query", () => {
    mockMatchMedia(false);
    renderHook(() => useIsMobile());
    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 1023px)");
  });

  it("follows media query changes", () => {
    const set = mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    act(() => set(true));
    expect(result.current).toBe(true);
  });
});
