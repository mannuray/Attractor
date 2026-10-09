import React from "react";
import { screen, fireEvent, within } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import "../attractors"; // registers all modules
import { registry } from "../attractors/registry";
import { SystemPanel, RenderPanel, ColorPanel, FxPanel } from "../components/panels";
import { paletteGradient } from "../components/panels/ColorPanel";
import { formatDuration } from "../components/panels/StatsReadout";

describe("SystemPanel", () => {
  it("shows the active system's category and filters by search", () => {
    renderWithTheme(<SystemPanel value="clifford" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Attractors" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.change(screen.getByRole("searchbox", { name: "Search systems" }), { target: { value: "jong" } });
    const items = within(screen.getByRole("list", { name: "Systems" })).getAllByRole("button");
    expect(items.length).toBeGreaterThan(0);
    items.forEach(o => expect(o.textContent!.toLowerCase()).toContain("jong"));
  });

  it("search spans all categories", () => {
    renderWithTheme(<SystemPanel value="clifford" onChange={() => {}} />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search systems" }), { target: { value: "mandel" } });
    expect(screen.getByRole("button", { name: /mandelbrot/i })).toBeInTheDocument();
  });

  it("systems are keyboard-focusable buttons; picking calls onChange and onPicked", () => {
    const onChange = jest.fn();
    const onPicked = jest.fn();
    renderWithTheme(<SystemPanel value="clifford" onChange={onChange} onPicked={onPicked} />);
    fireEvent.click(screen.getByRole("button", { name: "Fractals" }));
    const first = registry.getByCategory("Fractals")[0];
    const item = screen.getByRole("button", { name: first.label });
    expect(item.tagName).toBe("BUTTON");
    fireEvent.click(item);
    expect(onChange).toHaveBeenCalledWith(first.id);
    expect(onPicked).toHaveBeenCalled();
  });

  it("marks the current system", () => {
    renderWithTheme(<SystemPanel value="clifford" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Clifford" })).toHaveAttribute("aria-current", "true");
  });

  it("can hide the search box", () => {
    renderWithTheme(<SystemPanel value="clifford" onChange={() => {}} showSearch={false} />);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });
});

describe("RenderPanel", () => {
  it("changes size and quality", () => {
    const onSize = jest.fn();
    const onQ = jest.fn();
    renderWithTheme(<RenderPanel canvasSize={1200} onCanvasSizeChange={onSize} oversampling={2} onOversamplingChange={onQ} />);
    fireEvent.click(screen.getByRole("radio", { name: "2400" }));
    expect(onSize).toHaveBeenCalledWith(2400);
    fireEvent.click(screen.getByRole("radio", { name: "4×" }));
    expect(onQ).toHaveBeenCalledWith(4);
  });
});

describe("ColorPanel", () => {
  const palette = [
    { position: 0, red: 0, green: 0, blue: 0 },
    { position: 1, red: 255, green: 255, blue: 255 },
  ];
  it("reflects and changes background mode", () => {
    const onMode = jest.fn();
    renderWithTheme(<ColorPanel paletteData={palette as any} bgColor={{ r: 0, g: 0, b: 0 }} onBgModeChange={onMode} onOpenPalette={() => {}} />);
    expect(screen.getByRole("radio", { name: "Void" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "Paper" }));
    expect(onMode).toHaveBeenCalledWith("paper");
  });

  it("opens the palette editor", () => {
    const onOpen = jest.fn();
    renderWithTheme(<ColorPanel paletteData={palette as any} bgColor={{ r: 0, g: 0, b: 0 }} onBgModeChange={() => {}} onOpenPalette={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit palette" }));
    expect(onOpen).toHaveBeenCalled();
  });

  it("builds a gradient from palette stops", () => {
    expect(paletteGradient(palette as any)).toBe("linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(255, 255, 255) 100%)");
    expect(paletteGradient([])).toBe("none");
  });
});

describe("FxPanel", () => {
  it("toggles effects", () => {
    const onChange = jest.fn();
    renderWithTheme(<FxPanel fx={{ enabled: false, bloom: 0, grain: 0, vignette: 0, exposure: 1 }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch", { name: "Effects" }));
    expect(onChange).toHaveBeenCalledWith({ enabled: true });
  });
});

describe("formatDuration", () => {
  it("formats mm:ss", () => {
    expect(formatDuration(0)).toBe("00:00");
    expect(formatDuration(75_000)).toBe("01:15");
    expect(formatDuration(3_600_000)).toBe("60:00");
  });
});
