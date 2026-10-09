import React, { useReducer } from "react";
import { screen, fireEvent, act } from "@testing-library/react";
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

  it("a swipe that produces no click does not swallow the next tap on the handle", () => {
    renderWithTheme(<Harness />);
    const handle = screen.getByRole("button", { name: "Expand panel" });
    const fire = (type: string, y: number) =>
      act(() => { handle.dispatchEvent(new MouseEvent(type, { bubbles: true, clientY: y })); });
    fire("pointerdown", 300);
    fire("pointerup", 200); // swipe up, no click follows (touch past tap tolerance)
    expect(screen.getByTestId("panel-params")).toBeInTheDocument();
    fire("pointerdown", 500);
    fire("pointerup", 500);
    fireEvent.click(screen.getByRole("button", { name: "Collapse panel" }));
    expect(screen.queryByTestId("panel-params")).toBeNull();
  });

  it("peek tabs report the current tab as selected", () => {
    renderWithTheme(<Harness />);
    expect(screen.getByRole("tab", { name: "Params" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Color" })).toHaveAttribute("aria-selected", "false");
  });

  it("expanded panel is labelled by its tab", () => {
    renderWithTheme(<Harness />);
    fireEvent.click(screen.getByRole("tab", { name: "Color" }));
    const tab = screen.getByRole("tab", { name: "Color" });
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tab.id);
  });

  it("the click produced by a swipe is ignored, but a keyboard press afterwards is not", () => {
    renderWithTheme(<Harness />);
    const handle = screen.getByRole("button", { name: "Expand panel" });
    const fire = (type: string, y: number, detail = 0) =>
      act(() => { handle.dispatchEvent(new MouseEvent(type, { bubbles: true, clientY: y, detail })); });
    fire("pointerdown", 300);
    fire("pointerup", 200);            // swipe up → expanded
    fire("click", 200, 1);             // the swipe's own pointer click: ignored
    expect(screen.getByTestId("panel-params")).toBeInTheDocument();
    fire("pointerdown", 200);
    fire("pointerup", 300);            // swipe down → collapsed, no click follows
    expect(screen.queryByTestId("panel-params")).toBeNull();
    fire("click", 0, 0);               // keyboard Enter on the handle (detail 0) toggles
    expect(screen.getByTestId("panel-params")).toBeInTheDocument();
  });
});

