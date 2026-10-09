import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import "../attractors";
import { Inspector } from "../components/shell/Inspector";
import { makeShellProps } from "./shellProps";

const renderInspector = (over = {}, collapsed = false, onToggleCollapse = () => {}) =>
  renderWithTheme(<Inspector {...makeShellProps(over)} collapsed={collapsed} onToggleCollapse={onToggleCollapse} />);

describe("Inspector (single scrolling panel)", () => {
  beforeAll(() => { Element.prototype.scrollIntoView = jest.fn(); });

  it("shows every section at once", () => {
    renderInspector();
    expect(screen.getByRole("button", { name: "Attractors" })).toBeInTheDocument();
    expect(screen.getByTestId("controls")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Size" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Background" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Effects" })).toBeInTheDocument();
    expect(screen.getByLabelText("Render statistics")).toBeInTheDocument();
  });

  it("jump pills scroll their section into view and mark it current", () => {
    renderInspector();
    const jump = screen.getByRole("button", { name: "Jump to Color" });
    fireEvent.click(jump);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(jump).toHaveAttribute("aria-current", "true");
  });

  it("footer actions reset parameters and run", () => {
    const p = makeShellProps();
    renderWithTheme(<Inspector {...p} collapsed={false} onToggleCollapse={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Reset parameters" }));
    expect(p.onResetFractalView).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(p.onToggleIteration).toHaveBeenCalled();
  });

  it("collapsed: hides content, keeps expand control", () => {
    const onToggle = jest.fn();
    renderInspector({}, true, onToggle);
    expect(screen.queryByTestId("controls")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Expand inspector" }));
    expect(onToggle).toHaveBeenCalled();
  });

  it("scrolling the panel updates the current jump pill", () => {
    renderInspector();
    const tops: Record<string, number> = { System: 0, Parameters: 200, Render: 600, Color: 800, Effects: 1000 };
    for (const [name, top] of Object.entries(tops)) {
      Object.defineProperty(screen.getByRole("region", { name }), "offsetTop", { configurable: true, value: top });
    }
    const body = screen.getByTestId("inspector-body");
    body.scrollTop = 620;
    fireEvent.scroll(body);
    expect(screen.getByRole("button", { name: "Jump to Render" })).toHaveAttribute("aria-current", "true");
  });
});

