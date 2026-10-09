import { renderHook, act } from "@testing-library/react";
import { useShare } from "../hooks/useShare";

describe("useShare", () => {
  const original = navigator.clipboard;
  afterEach(() => { Object.assign(navigator, { clipboard: original }); jest.useRealTimers(); });

  it("reports copied, then resets", async () => {
    jest.useFakeTimers();
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
    const { result } = renderHook(() => useShare(1000));
    await act(async () => { await result.current.share(); });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    expect(result.current.status).toBe("copied");
    act(() => { jest.advanceTimersByTime(1000); });
    expect(result.current.status).toBe("idle");
  });

  it("reports failed when the clipboard rejects", async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(new Error("denied")) } });
    const { result } = renderHook(() => useShare());
    await act(async () => { await result.current.share(); });
    expect(result.current.status).toBe("failed");
  });

  it("reports failed when the clipboard API is missing", async () => {
    Object.assign(navigator, { clipboard: undefined });
    const { result } = renderHook(() => useShare());
    await act(async () => { await result.current.share(); });
    expect(result.current.status).toBe("failed");
  });
});
