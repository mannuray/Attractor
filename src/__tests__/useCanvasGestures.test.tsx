import { renderHook, act } from "@testing-library/react";
import { useCanvasGestures } from "../hooks/useCanvasGestures";

const ev = (pointerId: number, x: number, y: number, pointerType = "touch") =>
  ({ pointerId, clientX: x, clientY: y, pointerType, currentTarget: { setPointerCapture() {}, releasePointerCapture() {} }, preventDefault() {} }) as any;

function setup(selectEnabled: boolean) {
  const scrollBy = jest.fn();
  const opts = {
    zoom: 1,
    onZoomChange: jest.fn(),
    scrollRef: { current: { scrollBy } as any },
    selectEnabled,
    toCanvasPoint: (x: number, y: number) => ({ x, y }),
    onSelectStart: jest.fn(), onSelectMove: jest.fn(), onSelectEnd: jest.fn(),
  };
  const { result } = renderHook(() => useCanvasGestures(opts));
  return { h: () => result.current, opts, scrollBy };
}

describe("useCanvasGestures", () => {
  it("one pointer on a fractal drives selection", () => {
    const { h, opts } = setup(true);
    act(() => { h().onPointerDown(ev(1, 10, 10)); h().onPointerMove(ev(1, 50, 60)); h().onPointerUp(ev(1, 50, 60)); });
    expect(opts.onSelectStart).toHaveBeenCalledWith({ x: 10, y: 10 });
    expect(opts.onSelectMove).toHaveBeenCalledWith({ x: 50, y: 60 });
    expect(opts.onSelectEnd).toHaveBeenCalledTimes(1);
  });

  it("one touch on an attractor pans", () => {
    const { h, scrollBy } = setup(false);
    act(() => { h().onPointerDown(ev(1, 100, 100)); h().onPointerMove(ev(1, 80, 70)); });
    expect(scrollBy).toHaveBeenCalledWith(20, 30);
  });

  it("one mouse pointer on an attractor does nothing", () => {
    const { h, scrollBy, opts } = setup(false);
    act(() => { h().onPointerDown(ev(1, 100, 100, "mouse")); h().onPointerMove(ev(1, 80, 70, "mouse")); });
    expect(scrollBy).not.toHaveBeenCalled();
    expect(opts.onSelectStart).not.toHaveBeenCalled();
  });

  it("two pointers pinch-zoom and cancel a selection in progress", () => {
    const { h, opts } = setup(true);
    act(() => {
      h().onPointerDown(ev(1, 100, 100));
      h().onPointerDown(ev(2, 200, 100));       // dist 100
      h().onPointerMove(ev(2, 300, 100));       // dist 200
    });
    expect(opts.onSelectEnd).toHaveBeenCalled();
    expect(opts.onZoomChange).toHaveBeenLastCalledWith(2);
  });

  it("ignores a third pointer and stays finite when fingers coincide", () => {
    const { h, opts } = setup(false);
    act(() => {
      h().onPointerDown(ev(1, 100, 100));
      h().onPointerDown(ev(2, 100, 100));       // dist 0
      h().onPointerDown(ev(3, 300, 300));       // ignored
      h().onPointerMove(ev(2, 150, 100));
    });
    for (const [z] of opts.onZoomChange.mock.calls) {
      expect(Number.isFinite(z)).toBe(true);
      expect(z).toBeGreaterThanOrEqual(0.1);
      expect(z).toBeLessThanOrEqual(4);
    }
  });

  it("lifting one finger ends the pinch; the remaining finger does not pan", () => {
    const { h, scrollBy } = setup(false);
    act(() => {
      h().onPointerDown(ev(1, 100, 100));
      h().onPointerDown(ev(2, 200, 100));
      h().onPointerUp(ev(2, 200, 100));
      h().onPointerMove(ev(1, 50, 50));
    });
    expect(scrollBy).not.toHaveBeenCalledWith(50, 50);
  });

  it("a pinch that interrupts a selection calls onSelectCancel (not onSelectEnd) when provided", () => {
    const onSelectCancel = jest.fn();
    const onSelectEnd = jest.fn();
    const opts = {
      zoom: 1, onZoomChange: jest.fn(), scrollRef: { current: { scrollBy: jest.fn() } as any },
      selectEnabled: true, toCanvasPoint: (x: number, y: number) => ({ x, y }),
      onSelectStart: jest.fn(), onSelectMove: jest.fn(), onSelectEnd, onSelectCancel,
    };
    const { result } = renderHook(() => useCanvasGestures(opts));
    act(() => {
      result.current.onPointerDown(ev(1, 10, 10));
      result.current.onPointerDown(ev(2, 100, 10));
      result.current.onPointerUp(ev(2, 100, 10));
      result.current.onPointerUp(ev(1, 10, 10));
    });
    expect(onSelectCancel).toHaveBeenCalledTimes(1);
    expect(onSelectEnd).not.toHaveBeenCalled();
  });
});

