import React from "react";
import { screen, fireEvent, act } from "@testing-library/react";
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

  it("shows the system count badge", () => {
    wrap(<TopBar systemLabel="Clifford" systemCount={27} onSystemClick={() => {}} onOpenExport={() => {}} />);
    expect(screen.getByText("27 systems")).toBeInTheDocument();
  });

  it("opens a system picker popover when one is provided, and closes it on Escape or pick", () => {
    wrap(
      <TopBar systemLabel="Clifford" systemCount={27} onOpenExport={() => {}}
        renderSystemPicker={(close) => <button onClick={close}>Pick De Jong</button>} />
    );
    expect(screen.queryByRole("dialog", { name: "Choose system" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Clifford/ }));
    expect(screen.getByRole("dialog", { name: "Choose system" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Choose system" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Clifford/ }));
    fireEvent.click(screen.getByRole("button", { name: "Pick De Jong" }));
    expect(screen.queryByRole("dialog", { name: "Choose system" })).toBeNull();
  });

  it("compact Share shows a visible failure state when the clipboard is unavailable", async () => {
    const original = navigator.clipboard;
    Object.assign(navigator, { clipboard: undefined });
    wrap(<TopBar compact systemLabel="Clifford" onSystemClick={() => {}} onOpenExport={() => {}} />);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Share" })); });
    expect(screen.getByText("Couldn't copy", { selector: "[data-visible-status]" })).toBeInTheDocument();
    Object.assign(navigator, { clipboard: original });
  });

  it("moves focus into the system picker and returns it to the pill on Escape", () => {
    wrap(
      <TopBar systemLabel="Clifford" systemCount={27} onOpenExport={() => {}}
        renderSystemPicker={(close) => <><input aria-label="Search systems" /><button onClick={close}>Pick</button></>} />
    );
    const pill = screen.getByRole("button", { name: /Clifford/ });
    fireEvent.click(pill);
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Search systems" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).toBe(pill);
  });

  it("the picker can be opened from outside (controlled)", () => {
    const onPickerOpenChange = jest.fn();
    const { rerender } = wrap(
      <TopBar systemLabel="Clifford" onOpenExport={() => {}} pickerOpen={false} onPickerOpenChange={onPickerOpenChange}
        renderSystemPicker={() => <button>Pick</button>} />
    );
    expect(screen.queryByRole("dialog", { name: "Choose system" })).toBeNull();
    rerender(
      <MemoryRouter><AppThemeProvider>
        <TopBar systemLabel="Clifford" onOpenExport={() => {}} pickerOpen onPickerOpenChange={onPickerOpenChange}
          renderSystemPicker={() => <button>Pick</button>} />
      </AppThemeProvider></MemoryRouter>
    );
    expect(screen.getByRole("dialog", { name: "Choose system" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onPickerOpenChange).toHaveBeenCalledWith(false);
  });
});

