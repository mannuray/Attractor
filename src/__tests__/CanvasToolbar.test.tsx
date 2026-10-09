import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { CanvasToolbar, CanvasToolbarProps } from "../components/shell/CanvasToolbar";

const base = (): CanvasToolbarProps => ({
  iterating: false, onToggleIteration: jest.fn(),
  hunting: false, onHunt: jest.fn(), onCancelHunt: jest.fn(),
  isFractalType: false, zoom: 1,
  onFitToView: jest.fn(), onZoomIn: jest.fn(), onZoomOut: jest.fn(), onZoomReset: jest.fn(),
  onResetFractalView: jest.fn(),
});

describe("CanvasToolbar", () => {
  it("toggles run/pause label", () => {
    const p = base();
    const { rerender } = renderWithTheme(<CanvasToolbar {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(p.onToggleIteration).toHaveBeenCalled();
    rerender(<CanvasToolbar {...p} iterating />);
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("hunt becomes cancel while hunting", () => {
    const p = base();
    const { rerender } = renderWithTheme(<CanvasToolbar {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "Hunt" }));
    expect(p.onHunt).toHaveBeenCalled();
    rerender(<CanvasToolbar {...p} hunting />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel hunt" }));
    expect(p.onCancelHunt).toHaveBeenCalled();
  });

  it("hides hunt and shows recenter for fractals", () => {
    renderWithTheme(<CanvasToolbar {...base()} isFractalType />);
    expect(screen.queryByRole("button", { name: "Hunt" })).toBeNull();
    expect(screen.getByRole("button", { name: "Recenter" })).toBeInTheDocument();
  });

  it("shows zoom percentage and zoom controls on desktop", () => {
    const p = base();
    renderWithTheme(<CanvasToolbar {...p} zoom={1.5} />);
    expect(screen.getByText("150%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    fireEvent.click(screen.getByRole("button", { name: "Actual size" }));
    fireEvent.click(screen.getByRole("button", { name: "Fit to view" }));
    expect(p.onZoomIn).toHaveBeenCalled();
    expect(p.onZoomOut).toHaveBeenCalled();
    expect(p.onZoomReset).toHaveBeenCalled();
    expect(p.onFitToView).toHaveBeenCalled();
  });

  it("mobile variant only has the thumb row", () => {
    renderWithTheme(<CanvasToolbar {...base()} variant="mobile" />);
    expect(screen.getByRole("button", { name: "Run" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fit to view" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Zoom in" })).toBeNull();
  });

  it("labels the main action Render for fractals, as today", () => {
    renderWithTheme(<CanvasToolbar {...base()} isFractalType />);
    expect(screen.getByRole("button", { name: "Render" })).toBeInTheDocument();
  });
});
