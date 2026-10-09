import React from "react";
import { screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithTheme } from "./renderWithTheme";
import { ThemeProvider as AppThemeProvider } from "../theme/ThemeContext";
import "../attractors";
import { ResponsiveShell } from "../components/shell";
import { makeShellProps } from "./shellProps";

type L = (e: { matches: boolean }) => void;
function mockMatchMedia(initial: boolean) {
  let matches = initial; const ls: L[] = [];
  window.matchMedia = jest.fn().mockImplementation(() => ({
    get matches() { return matches; },
    addEventListener: (_: string, l: L) => ls.push(l),
    removeEventListener: (_: string, l: L) => ls.splice(ls.indexOf(l), 1),
  })) as any;
  return (v: boolean) => { matches = v; ls.forEach(l => l({ matches })); };
}

describe("ResponsiveShell", () => {
  it("renders the same canvas and run state on both sides of the breakpoint", () => {
    const set = mockMatchMedia(false);
    const props = makeShellProps({ systemLabel: "Clifford", iterating: true });
    renderWithTheme(<MemoryRouter><AppThemeProvider><ResponsiveShell {...props} /></AppThemeProvider></MemoryRouter>);
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

    act(() => set(true));
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Clifford/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("does not remount the canvas when crossing the breakpoint (the worker owns the canvas element)", () => {
    const set = mockMatchMedia(false);
    let mounts = 0;
    const Probe = () => { React.useEffect(() => { mounts += 1; }, []); return <canvas data-testid="probe" />; };
    const props = makeShellProps({ canvas: <Probe /> });
    renderWithTheme(<MemoryRouter><AppThemeProvider><ResponsiveShell {...props} /></AppThemeProvider></MemoryRouter>);
    const before = screen.getByTestId("probe");
    act(() => set(true));
    act(() => set(false));
    expect(mounts).toBe(1);
    expect(screen.getByTestId("probe")).toBe(before);
  });
});
