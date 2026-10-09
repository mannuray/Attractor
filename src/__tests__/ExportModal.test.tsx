import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { ExportModal } from "../components/ExportModal";

const props = () => ({ isOpen: true, onClose: jest.fn(), onExportCurrent: jest.fn(), onExportSize: jest.fn(), exporting: false });

describe("ExportModal", () => {
  it("is a labelled dialog", () => {
    renderWithTheme(<ExportModal {...props()} />);
    expect(screen.getByRole("dialog", { name: "Export image" })).toBeInTheDocument();
  });

  it("exports the selected size", () => {
    const p = props();
    renderWithTheme(<ExportModal {...p} />);
    fireEvent.click(screen.getByRole("radio", { name: "2160 px (4K)" }));
    fireEvent.click(screen.getByRole("button", { name: "Export PNG" }));
    expect(p.onExportSize).toHaveBeenCalledWith(2160);
  });

  it("current view exports immediately and closes", () => {
    const p = props();
    renderWithTheme(<ExportModal {...p} />);
    fireEvent.click(screen.getByRole("radio", { name: "Current view" }));
    fireEvent.click(screen.getByRole("button", { name: "Export PNG" }));
    expect(p.onExportCurrent).toHaveBeenCalled();
    expect(p.onClose).toHaveBeenCalled();
  });

  it("cannot be closed while exporting (backdrop, X, Escape)", () => {
    const p = { ...props(), exporting: true };
    renderWithTheme(<ExportModal {...p} />);
    fireEvent.click(screen.getByTestId("modal-backdrop"));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(p.onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("Escape closes when idle", () => {
    const p = props();
    renderWithTheme(<ExportModal {...p} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(p.onClose).toHaveBeenCalled();
  });
});
