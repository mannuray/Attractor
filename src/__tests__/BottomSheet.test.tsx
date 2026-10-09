import React, { useReducer } from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { BottomSheet } from "../components/shell/BottomSheet";
import { sheetReducer, initialSheet } from "../lib/sheetState";

function Harness() {
  const [state, dispatch] = useReducer(sheetReducer, initialSheet);
  return (
    <BottomSheet state={state} dispatch={dispatch} actionRow={<button>Run</button>}>
      <div data-testid={`panel-${state.tab}`} />
    </BottomSheet>
  );
}

describe("BottomSheet", () => {
  it("peek shows action row and tabs but no panel", () => {
    renderWithTheme(<Harness />);
    expect(screen.getByRole("button", { name: "Run" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Params" })).toBeInTheDocument();
    expect(screen.queryByTestId("panel-params")).toBeNull();
  });

  it("tapping a tab expands to it; tapping again collapses", () => {
    renderWithTheme(<Harness />);
    fireEvent.click(screen.getByRole("tab", { name: "Color" }));
    expect(screen.getByTestId("panel-color")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Color" })).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("tab", { name: "Color" }));
    expect(screen.queryByTestId("panel-color")).toBeNull();
  });

  it("handle toggles expansion", () => {
    renderWithTheme(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Expand panel" }));
    expect(screen.getByTestId("panel-params")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Collapse panel" }));
    expect(screen.queryByTestId("panel-params")).toBeNull();
  });
});
