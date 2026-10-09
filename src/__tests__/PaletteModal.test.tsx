import { screen, fireEvent, within } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { PaletteModal } from "../components/PaletteModal";

const stops = [
  { position: 0, red: 0, green: 0, blue: 0 },
  { position: 0.5, red: 30, green: 90, blue: 156 },
  { position: 1, red: 255, green: 255, blue: 255 },
];

const props = () => ({
  isOpen: true, onClose: jest.fn(), subtitle: "Symmetric Icon",
  paletteData: stops as any, onPaletteChange: jest.fn(),
  palGamma: 0.5, onGammaChange: jest.fn(),
  palScale: true, onScaleModeChange: jest.fn(), palMax: 1000, onPalMaxChange: jest.fn(),
  bgColor: { r: 0, g: 0, b: 0 }, onBgColorChange: jest.fn(),
});

describe("PaletteModal", () => {
  it("is a dialog labelled Palette with the system as subtitle and a stop count", () => {
    renderWithTheme(<PaletteModal {...props()} />);
    const dialog = screen.getByRole("dialog", { name: "Palette" });
    expect(within(dialog).getByText("Symmetric Icon")).toBeInTheDocument();
    expect(within(dialog).getByText("3 stops")).toBeInTheDocument();
    expect(screen.queryByText(/Engine\.|Base\.Canvas/)).toBeNull();
  });

  it("selecting an end stop disables Delete; a middle stop can be deleted", () => {
    const p = props();
    renderWithTheme(<PaletteModal {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "Stop 1 at 0%" }));
    expect(screen.getByRole("button", { name: "Delete stop" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Stop 2 at 50%" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete stop" }));
    expect(p.onPaletteChange).toHaveBeenLastCalledWith([stops[0], stops[2]]);
  });

  it("editing HEX updates the selected stop", () => {
    const p = props();
    renderWithTheme(<PaletteModal {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "Stop 2 at 50%" }));
    const hex = screen.getByRole("textbox", { name: "HEX" });
    fireEvent.change(hex, { target: { value: "FF0000" } });
    fireEvent.blur(hex);
    expect(p.onPaletteChange).toHaveBeenLastCalledWith([stops[0], { position: 0.5, red: 255, green: 0, blue: 0 }, stops[2]]);
  });

  it("gamma slider and normalize controls", () => {
    const p = props();
    const { rerender } = renderWithTheme(<PaletteModal {...p} />);
    fireEvent.change(screen.getByRole("slider", { name: "Gamma" }), { target: { value: "1.2" } });
    expect(p.onGammaChange).toHaveBeenCalledWith(1.2);
    expect(screen.queryByRole("spinbutton", { name: "Max" })).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "Manual" }));
    expect(p.onScaleModeChange).toHaveBeenCalledWith(false);
    rerender(<PaletteModal {...p} palScale={false} />);
    expect(screen.getByRole("spinbutton", { name: "Max" })).toBeInTheDocument();
  });

  it("background presets set void/paper colors", () => {
    const p = props();
    renderWithTheme(<PaletteModal {...p} />);
    fireEvent.click(screen.getByRole("radio", { name: "Paper" }));
    expect(p.onBgColorChange).toHaveBeenCalledWith({ r: 255, g: 255, b: 255 });
  });

  it("Reset restores the palette and gamma as they were when the editor opened", () => {
    const p = props();
    const { rerender } = renderWithTheme(<PaletteModal {...p} />);
    rerender(<PaletteModal {...p} paletteData={[stops[0], stops[2]] as any} palGamma={1.4} />);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(p.onPaletteChange).toHaveBeenLastCalledWith(stops);
    expect(p.onGammaChange).toHaveBeenLastCalledWith(0.5);
  });

  it("Done, Close and Escape close the editor", () => {
    const p = props();
    renderWithTheme(<PaletteModal {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(p.onClose).toHaveBeenCalledTimes(3);
  });
});
