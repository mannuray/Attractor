import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithTheme } from "./renderWithTheme";
import { ThemeProvider as AppThemeProvider } from "../theme/ThemeContext";
import { TopBar } from "../components/shell/TopBar";

const wrap = (ui: React.ReactElement) =>
  renderWithTheme(<MemoryRouter><AppThemeProvider>{ui}</AppThemeProvider></MemoryRouter>);

describe("TopBar", () => {
  it("shows the system pill and opens the picker", () => {
    const onSystemClick = jest.fn();
    wrap(<TopBar systemLabel="Clifford" onSystemClick={onSystemClick} onOpenExport={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Clifford/ }));
    expect(onSystemClick).toHaveBeenCalled();
  });

  it("export opens the export modal", () => {
    const onOpenExport = jest.fn();
    wrap(<TopBar systemLabel="Clifford" onSystemClick={() => {}} onOpenExport={onOpenExport} />);
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(onOpenExport).toHaveBeenCalled();
  });

  it("compact mode hides export, docs and theme", () => {
    wrap(<TopBar compact systemLabel="Clifford" onSystemClick={() => {}} onOpenExport={() => {}} />);
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Theme" })).toBeNull();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
  });
});
