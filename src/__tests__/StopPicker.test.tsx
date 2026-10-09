import React, { useState } from "react";
import { screen, act } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { StopPicker } from "../components/palette/StopPicker";
import { RGB } from "../lib/colorRamp";

function Parent({ onCommit }: { onCommit: (c: RGB) => void }) {
  const [, setDraft] = useState<RGB | null>(null);
  return (
    <StopPicker color={{ red: 30, green: 90, blue: 156 }} position={0.5} canDelete
      onDraft={setDraft} onCommit={onCommit} onDelete={() => {}} />
  );
}

describe("StopPicker drag", () => {
  it("dragging updates the parent without render-phase side effects and commits the final color", () => {
    const errors = jest.spyOn(console, "error").mockImplementation(() => {});
    const onCommit = jest.fn();
    renderWithTheme(<Parent onCommit={onCommit} />);
    const sv = screen.getByLabelText("Saturation and brightness");
    sv.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON() {} });
    const fire = (type: string, x: number, y: number) => sv.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }));
    act(() => {
      fire("pointerdown", 10, 10);
      fire("pointermove", 50, 50);
      fire("pointermove", 100, 0);
      fire("pointerup", 100, 0);
    });
    const warned = errors.mock.calls.some(c => String(c[0]).includes("Cannot update a component"));
    errors.mockRestore();
    expect(warned).toBe(false);
    // s = 1, v = 1 at (100, 0) with the original hue
    expect(onCommit).toHaveBeenCalledTimes(1);
    const c = onCommit.mock.calls[0][0] as RGB;
    expect(Math.max(c.red, c.green, c.blue)).toBe(255);
  });
});
