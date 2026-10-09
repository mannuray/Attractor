import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { CanvasToolbar, CanvasToolbarProps } from "../components/shell/CanvasToolbar";

const base = (): CanvasToolbarProps => ({
  iterating: false, onToggleIteration: jest.fn(),
  hunting: false, onHunt: jest.fn(), onCancelHunt: jest.fn(),
  isFractalType: false, zoomLabel: "100%",
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

  it("shows the zoom label and zoom controls on desktop", () => {
    const p = base();
    renderWithTheme(<CanvasToolbar {...p} zoomLabel="150%" />);
    expect(screen.getByText("150%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    fireEvent.click(screen.getByRole("button", { name: "Actual pixels" }));
    fireEvent.click(screen.getByRole("button", { name: "Fit to view" }));
    expect(p.onZoomIn).toHaveBeenCalled();
    expect(p.onZoomOut).toHaveBeenCalled();
    expect(p.onZoomReset).toHaveBeenCalled();
    expect(p.onFitToView).toHaveBeenCalled();
  });

  it("fractals zoom the maths: depth label, no actual-pixels button", () => {
    renderWithTheme(<CanvasToolbar {...base()} isFractalType zoomLabel="12.5×" />);
    expect(screen.getByText("12.5×")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Actual pixels" })).toBeNull();
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

  it("shows refinement progress instead of a pulsing glow", () => {
    const { rerender } = renderWithTheme(<CanvasToolbar {...base()} isFractalType renderProgress={0.62} />);
    const bar = screen.getByRole("progressbar", { name: "Refining" });
    expect(bar).toHaveAttribute("aria-valuenow", "62");
    expect(screen.getByText("Refining 62%")).toBeInTheDocument();
    rerender(<CanvasToolbar {...base()} isFractalType renderProgress={null} />);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("mobile shows the progress bar too", () => {
    renderWithTheme(<CanvasToolbar {...base()} isFractalType variant="mobile" renderProgress={0.3} />);
    expect(screen.getByRole("progressbar", { name: "Refining" })).toHaveAttribute("aria-valuenow", "30");
  });
});

