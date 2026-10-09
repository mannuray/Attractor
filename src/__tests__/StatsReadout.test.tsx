import React from "react";
import { act } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { StatsReadout } from "../components/panels/StatsReadout";

describe("StatsReadout", () => {
  it("keeps elapsed time when it remounts (shell swap, inspector collapse)", () => {
    jest.useFakeTimers();
    let now = 1000;
    const perf = jest.spyOn(performance, "now").mockImplementation(() => now);
    const statsRef = { current: { maxHits: 0, totalIterations: 0 } };
    const view = (
      <StatsReadout statsRef={statsRef} running rendering={false} isFractal={false} />
    );
    const first = renderWithTheme(view);
    for (let i = 1; i <= 12; i++) {
      now += 250; statsRef.current.totalIterations += 1000;
      act(() => { jest.advanceTimersByTime(250); });
    }
    expect(first.getByText("00:02")).toBeInTheDocument();
    first.unmount();

    const second = renderWithTheme(view);
    now += 250; statsRef.current.totalIterations += 1000;
    act(() => { jest.advanceTimersByTime(250); });
    expect(second.getByText("00:03")).toBeInTheDocument();
    perf.mockRestore();
    jest.useRealTimers();
  });
});
