import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { PaletteModal } from "../components/PaletteModal";

const props = () => ({
  isOpen: true, onClose: jest.fn(),
  paletteData: [{ position: 0, red: 0, green: 0, blue: 0 }, { position: 1, red: 255, green: 255, blue: 255 }] as any,
  onPaletteChange: jest.fn(), palGamma: 0.5, onGammaChange: jest.fn(),
  palScale: true, onScaleModeChange: jest.fn(), palMax: 1000, onPalMaxChange: jest.fn(),
  bgColor: { r: 0, g: 0, b: 0 }, onBgColorChange: jest.fn(),
});

describe("PaletteModal", () => {
  it("is a dialog labelled Palette with plain labels", () => {
    renderWithTheme(<PaletteModal {...props()} />);
    expect(screen.getByRole("dialog", { name: "Palette" })).toBeInTheDocument();
    expect(screen.getByText(/^Gamma/)).toBeInTheDocument();
    expect(screen.queryByText(/Engine\.|Base\.Canvas/)).toBeNull();
  });

  it("closes on Escape and via the labelled close button", () => {
    const p = props();
    renderWithTheme(<PaletteModal {...p} />);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(p.onClose).toHaveBeenCalledTimes(2);
  });
});
