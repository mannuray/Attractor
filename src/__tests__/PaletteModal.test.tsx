import { screen, fireEvent, within, act } from "@testing-library/react";
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

  describe("palettes whose first stops share position 0", () => {
    const dupStops = [
      { position: 0, red: 0, green: 0, blue: 0 },
      { position: 0, red: 10, green: 10, blue: 10 },
      { position: 0.0189474, red: 20, green: 20, blue: 20 },
      { position: 0.6, red: 30, green: 90, blue: 156 },
      { position: 1, red: 255, green: 255, blue: 255 },
    ];

    it("tapping a stop (down, tiny move, up) does not change the palette", () => {
      const p = { ...props(), paletteData: dupStops as any };
      renderWithTheme(<PaletteModal {...p} />);
      const handle = screen.getByRole("button", { name: "Stop 2 at 0%" });
      const fire = (type: string) => act(() => { handle.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: 1 })); });
      fire("pointerdown"); fire("pointermove"); fire("pointerup");
      expect(p.onPaletteChange).not.toHaveBeenCalled();
    });

    it("selects the stop nearest the middle by default", () => {
      renderWithTheme(<PaletteModal {...props()} paletteData={dupStops as any} />);
      expect(screen.getByRole("button", { name: "Stop 4 at 60%" })).toHaveAttribute("aria-pressed", "true");
    });

    it("end stops stack above overlapping middle stops so they stay clickable", () => {
      renderWithTheme(<PaletteModal {...props()} paletteData={dupStops as any} />);
      const end = Number(screen.getByRole("button", { name: "Stop 1 at 0%" }).style.zIndex);
      const mid = Number(screen.getByRole("button", { name: "Stop 2 at 0%" }).style.zIndex);
      expect(end).toBeGreaterThan(mid);
    });
  });
});

