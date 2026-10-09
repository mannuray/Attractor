import { renderHook, act } from "@testing-library/react";
import { useCanvasGestures } from "../hooks/useCanvasGestures";

const ev = (pointerId: number, x: number, y: number, pointerType = "touch", button = 0) =>
  ({ pointerId, clientX: x, clientY: y, pointerType, button, currentTarget: { setPointerCapture() {}, releasePointerCapture() {} }, preventDefault() {} }) as any;

function setup(selectEnabled: boolean, extra: Partial<Record<string, any>> = {}) {
  const opts = {
    selectEnabled,
    panHeld: () => false,
    toCanvasPoint: (x: number, y: number) => ({ x, y }),
    onSelectStart: jest.fn(), onSelectMove: jest.fn(), onSelectEnd: jest.fn(),
    onPan: jest.fn(), onZoomAt: jest.fn(), onGestureEnd: jest.fn(),
    ...extra,
  };
  const { result } = renderHook(() => useCanvasGestures(opts as any));
  return { h: () => result.current, opts: opts as typeof opts & { onSelectCancel: jest.Mock } };
}

describe("useCanvasGestures", () => {
  it("one pointer on a fractal drives selection", () => {
    const { h, opts } = setup(true);
    act(() => { h().onPointerDown(ev(1, 10, 10)); h().onPointerMove(ev(1, 50, 60)); h().onPointerUp(ev(1, 50, 60)); });
    expect(opts.onSelectStart).toHaveBeenCalledWith({ x: 10, y: 10 });
    expect(opts.onSelectMove).toHaveBeenCalledWith({ x: 50, y: 60 });
    expect(opts.onSelectEnd).toHaveBeenCalledTimes(1);
    expect(opts.onPan).not.toHaveBeenCalled();
  });

  it("with Space held, one pointer on a fractal pans instead of selecting", () => {
    const { h, opts } = setup(true, { panHeld: () => true });
    act(() => { h().onPointerDown(ev(1, 100, 100, "mouse")); h().onPointerMove(ev(1, 120, 90, "mouse")); h().onPointerUp(ev(1, 120, 90, "mouse")); });
    expect(opts.onSelectStart).not.toHaveBeenCalled();
    expect(opts.onPan).toHaveBeenCalledWith(20, -10);
    expect(opts.onGestureEnd).toHaveBeenCalledTimes(1);
  });

  it("dragging an attractor pans, with a mouse or a finger", () => {
    for (const type of ["mouse", "touch"]) {
      const { h, opts } = setup(false);
      act(() => { h().onPointerDown(ev(1, 100, 100, type)); h().onPointerMove(ev(1, 80, 70, type)); h().onPointerUp(ev(1, 80, 70, type)); });
      expect(opts.onPan).toHaveBeenCalledWith(-20, -30);
      expect(opts.onGestureEnd).toHaveBeenCalledTimes(1);
    }
  });

  it("ignores right/middle mouse buttons", () => {
    const { h, opts } = setup(false);
    act(() => { h().onPointerDown(ev(1, 100, 100, "mouse", 2)); h().onPointerMove(ev(1, 80, 70, "mouse", 2)); });
    expect(opts.onPan).not.toHaveBeenCalled();
  });

  it("two pointers zoom around their midpoint and cancel a selection in progress", () => {
    const { h, opts } = setup(true);
    act(() => {
      h().onPointerDown(ev(1, 100, 100));
      h().onPointerDown(ev(2, 200, 100));       // dist 100, mid (150,100)
      h().onPointerMove(ev(2, 300, 100));       // dist 200, mid (200,100)
    });
    expect(opts.onSelectEnd).toHaveBeenCalled();
    expect(opts.onZoomAt).toHaveBeenLastCalledWith(2, 200, 100);
    expect(opts.onPan).toHaveBeenLastCalledWith(50, 0);
  });

  it("pinch zoom is incremental", () => {
    const { h, opts } = setup(false);
    act(() => {
      h().onPointerDown(ev(1, 0, 0));
      h().onPointerDown(ev(2, 100, 0));
      h().onPointerMove(ev(2, 200, 0));         // ×2
      h().onPointerMove(ev(2, 400, 0));         // ×2 again (200 → 400)
    });
    expect(opts.onZoomAt.mock.calls.map((c: any[]) => c[0])).toEqual([2, 2]);
  });

  it("ignores a third pointer and stays finite when fingers coincide", () => {
    const { h, opts } = setup(false);
    act(() => {
      h().onPointerDown(ev(1, 100, 100));
      h().onPointerDown(ev(2, 100, 100));       // dist 0
      h().onPointerDown(ev(3, 300, 300));       // ignored
      h().onPointerMove(ev(2, 150, 100));
    });
    for (const [f] of opts.onZoomAt.mock.calls) expect(Number.isFinite(f)).toBe(true);
  });

  it("lifting one finger ends the pinch; the remaining finger does not pan", () => {
    const { h, opts } = setup(false);
    act(() => {
      h().onPointerDown(ev(1, 100, 100));
      h().onPointerDown(ev(2, 200, 100));
      h().onPointerMove(ev(2, 260, 100));
      h().onPointerUp(ev(2, 260, 100));
    });
    opts.onPan.mockClear();
    act(() => { h().onPointerMove(ev(1, 50, 50)); });
    expect(opts.onPan).not.toHaveBeenCalled();
    expect(opts.onGestureEnd).toHaveBeenCalledTimes(1);
  });

  it("a pinch that interrupts a selection calls onSelectCancel (not onSelectEnd) when provided", () => {
    const { h, opts } = setup(true, { onSelectCancel: jest.fn() });
    act(() => {
      h().onPointerDown(ev(1, 10, 10));
      h().onPointerDown(ev(2, 100, 10));
      h().onPointerUp(ev(2, 100, 10));
      h().onPointerUp(ev(1, 10, 10));
    });
    expect(opts.onSelectCancel).toHaveBeenCalledTimes(1);
    expect(opts.onSelectEnd).not.toHaveBeenCalled();
  });

  it("a pinch that starts with coincident fingers zooms once they spread", () => {
    const { h, opts } = setup(false);
    act(() => {
      h().onPointerDown(ev(1, 100, 100));
      h().onPointerDown(ev(2, 100, 100));   // dist 0: can't scale yet
      h().onPointerMove(ev(2, 120, 100));   // dist 20 → becomes the baseline
      h().onPointerMove(ev(2, 140, 100));   // dist 40 → 2×
    });
    expect(opts.onZoomAt).toHaveBeenLastCalledWith(2, 120, 100);
  });
});
