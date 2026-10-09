import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { PresetSelector } from "../attractors/shared/PresetSelector";

const options = [{ value: 0, label: "Cyan Caustic" }, { value: 1, label: "Violet Silk" }];

describe("PresetSelector", () => {
  it("renders presets as a radio group and keeps the string onChange contract", () => {
    const onChange = jest.fn();
    renderWithTheme(<PresetSelector label="Presets" value={1} options={options} onChange={onChange} />);
    expect(screen.getByRole("radiogroup", { name: "Presets" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Violet Silk" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "Cyan Caustic" }));
    expect(onChange).toHaveBeenCalledWith("0");
  });

  it("does nothing when disabled", () => {
    const onChange = jest.fn();
    renderWithTheme(<PresetSelector label="Presets" value={0} options={options} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole("radio", { name: "Violet Silk" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
