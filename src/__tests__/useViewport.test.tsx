import { renderHook, act } from "@testing-library/react";
import { useViewport } from "../hooks/useViewport";
import { rebaseView, canvasMapBetween, fitView } from "../lib/viewport";

const VP = { width: 1040, height: 640 };
const SIZE = 1200;

function container() {
  const el = document.createElement("div");
  Object.defineProperty(el, "clientWidth", { value: VP.width });
  Object.defineProperty(el, "clientHeight", { value: VP.height });
  el.getBoundingClientRect = () => ({ left: 100, top: 50, width: VP.width, height: VP.height, right: 0, bottom: 0, x: 100, y: 50, toJSON() {} });
  return { current: el };
}

function setup(onCommit?: jest.Mock, refitKey = "a") {
  const ref = container();
  return renderHook((props: { refitKey: string }) =>
    useViewport({ containerRef: ref, canvasSize: SIZE, refitKey: props.refitKey, onCommit }), { initialProps: { refitKey } });
}

const canvasPointAt = (v: { scale: number; x: number; y: number }, vx: number, vy: number) => [(vx - v.x) / v.scale, (vy - v.y) / v.scale];

describe("useViewport (attractors: CSS zoom)", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("starts fitted at 100%", () => {
    const { result } = setup();
    expect(result.current.view).toEqual(fitView(VP, SIZE));
    expect(result.current.percent).toBe(100);
  });

  it("zoom buttons keep the centre of the viewport still", () => {
    const { result } = setup();
    const before = canvasPointAt(result.current.view, 520, 320);
    act(() => result.current.zoomIn());
    expect(result.current.percent).toBe(150);
    const after = canvasPointAt(result.current.view, 520, 320);
    expect(after[0]).toBeCloseTo(before[0]);
    expect(after[1]).toBeCloseTo(before[1]);
    act(() => result.current.zoomOut());
    expect(result.current.percent).toBe(100);
  });

  it("wheel/pinch zoom keeps the point under the cursor still (client coordinates)", () => {
    const { result } = setup();
    act(() => { result.current.zoomIn(); result.current.zoomIn(); });   // wider than the viewport, so no recentring
    const before = canvasPointAt(result.current.view, 300, 200);
    act(() => result.current.zoomAtClient(1.3, 100 + 300, 50 + 200));
    const after = canvasPointAt(result.current.view, 300, 200);
    expect(after[0]).toBeCloseTo(before[0]);
    expect(after[1]).toBeCloseTo(before[1]);
  });

  it("stops at 800% and 25%", () => {
    const { result } = setup();
    act(() => { for (let i = 0; i < 20; i++) result.current.zoomIn(); });
    expect(result.current.percent).toBe(800);
    act(() => { for (let i = 0; i < 40; i++) result.current.zoomOut(); });
    expect(result.current.percent).toBe(25);
  });

  it("actual pixels shows one canvas pixel per screen pixel; fit returns", () => {
    const { result } = setup();
    act(() => result.current.actualPixels());
    expect(result.current.view.scale).toBe(1);
    expect(result.current.percent).toBe(200);
    act(() => result.current.fit());
    expect(result.current.view).toEqual(fitView(VP, SIZE));
  });

  it("panning cannot drag the image away from the viewport", () => {
    const { result } = setup();
    act(() => result.current.actualPixels());
    act(() => result.current.panBy(5000, 5000));
    expect(result.current.view.x).toBe(0);
    expect(result.current.view.y).toBe(0);
  });

  it("refits when the system changes", () => {
    const { result, rerender } = setup();
    act(() => result.current.zoomIn());
    rerender({ refitKey: "b" });
    expect(result.current.percent).toBe(100);
  });
});

describe("useViewport (fractals: zoom the math)", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("previews instantly, then commits once after the input settles", () => {
    const onCommit = jest.fn();
    const { result } = setup(onCommit);
    const base = result.current.view;
    act(() => { result.current.zoomIn(); result.current.zoomIn(); });
    expect(result.current.view.scale).toBeCloseTo(base.scale * 2.25);   // CSS preview
    expect(onCommit).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(300); });
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0][0].k).toBeCloseTo(1 / 2.25);
    // Preview stays until the new render's first frame arrives.
    expect(result.current.view.scale).toBeCloseTo(base.scale * 2.25);
    act(() => result.current.settle());
    expect(result.current.view).toEqual(base);
  });

  it("commits a pan when the gesture ends", () => {
    const onCommit = jest.fn();
    const { result } = setup(onCommit);
    act(() => result.current.panBy(50, 0));
    expect(onCommit).not.toHaveBeenCalled();
    act(() => result.current.gestureEnd());
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0][0].ox).toBeCloseTo(-50 / result.current.view.scale);
  });

  it("keeps one commit in flight: input during the wait is rebased onto the new render", () => {
    const onCommit = jest.fn();
    const { result } = setup(onCommit);
    const base = result.current.view;
    act(() => { result.current.panBy(40, 0); result.current.gestureEnd(); });
    act(() => { result.current.panBy(40, 0); result.current.gestureEnd(); });
    expect(onCommit).toHaveBeenCalledTimes(1);
    act(() => result.current.settle());           // first render arrives
    expect(result.current.view.x).toBeCloseTo(base.x + 40);   // the second pan, now relative to it
    expect(onCommit).toHaveBeenCalledTimes(2);
    expect(onCommit.mock.calls[1][0].ox).toBeCloseTo(-40 / base.scale);
  });

  it("falls back to dropping the preview if no frame arrives", () => {
    const { result } = setup(jest.fn());
    const base = result.current.view;
    act(() => { result.current.panBy(40, 0); result.current.gestureEnd(); });
    act(() => { jest.advanceTimersByTime(3000); });
    expect(result.current.view).toEqual(base);
  });
});

describe("rebaseView", () => {
  it("makes the new render at the result look like the old one at `shown`", () => {
    const base = fitView(VP, SIZE);
    const committed = { scale: base.scale * 2, x: base.x - 300, y: base.y - 100 };
    const shown = { scale: committed.scale * 1.5, x: committed.x - 50, y: committed.y + 20 };
    const v = rebaseView(shown, committed, base);
    // old canvas point c_old ↔ new canvas point c_new via the committed map
    const m = canvasMapBetween(base, committed);
    const cNew = 123;
    const cOld = cNew * m.k + m.ox;
    expect(v.x + v.scale * cNew).toBeCloseTo(shown.x + shown.scale * cOld);
  });
});
