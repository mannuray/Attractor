import React from "react";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import "../attractors";
import { Inspector } from "../components/shell/Inspector";
import { makeShellProps } from "./shellProps";

const renderInspector = (over = {}, collapsed = false, onToggleCollapse = () => {}) =>
  renderWithTheme(<Inspector {...makeShellProps(over)} collapsed={collapsed} onToggleCollapse={onToggleCollapse} />);

describe("Inspector tabs", () => {
  it("has four tabs; System & Parameters is selected first and shows system, presets and parameters", () => {
    renderInspector();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map(t => t.getAttribute("aria-label"))).toEqual(["System & Parameters", "Render", "Color", "Effects"]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: "Attractors" })).toBeInTheDocument();
    expect(screen.getByTestId("controls")).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: "Background" })).toBeNull();
  });

  it("switching tabs shows only that tab's panel", () => {
    renderInspector();
    fireEvent.click(screen.getByRole("tab", { name: "Color" }));
    expect(screen.getByRole("tab", { name: "Color" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("radiogroup", { name: "Background" })).toBeInTheDocument();
    expect(screen.queryByTestId("controls")).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: "Effects" }));
    expect(screen.getByRole("switch", { name: "Effects" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Render" }));
    expect(screen.getByRole("radiogroup", { name: "Size" })).toBeInTheDocument();
  });

  it("tab panel is labelled by its tab, and arrow keys move between tabs", () => {
    renderInspector();
    const first = screen.getByRole("tab", { name: "System & Parameters" });
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", first.id);
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Render" })).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Render" }));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "Effects" })).toHaveAttribute("aria-selected", "true");
  });

  it("stats and footer actions stay visible on every tab", () => {
    const p = makeShellProps();
    renderWithTheme(<Inspector {...p} collapsed={false} onToggleCollapse={() => {}} />);
    fireEvent.click(screen.getByRole("tab", { name: "Effects" }));
    expect(screen.getByLabelText("Render statistics")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(p.onToggleIteration).toHaveBeenCalled();
  });

  it("Reset offers Undo for a few seconds", () => {
    jest.useFakeTimers();
    const p = makeShellProps({ onUndoReset: jest.fn() } as any);
    renderWithTheme(<Inspector {...p} collapsed={false} onToggleCollapse={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Reset parameters" }));
    expect(p.onResetFractalView).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Parameters reset");
    fireEvent.click(screen.getByRole("button", { name: "Undo reset" }));
    expect((p as any).onUndoReset).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Undo reset" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reset parameters" }));
    act(() => { jest.advanceTimersByTime(6000); });
    expect(screen.queryByRole("button", { name: "Undo reset" })).toBeNull();
    jest.useRealTimers();
  });

  it("collapsed: hides content; clicking a tab icon expands to that tab", () => {
    const onToggle = jest.fn();
    renderInspector({}, true, onToggle);
    expect(screen.queryByTestId("controls")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Expand inspector" }));
    expect(onToggle).toHaveBeenCalled();
  });
});
