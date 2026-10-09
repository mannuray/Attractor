import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { Segmented } from "../components/ui/Segmented";
import { Chip } from "../components/ui/Chip";

describe("Segmented", () => {
  it("marks the selected option and reports changes", () => {
    const onChange = jest.fn();
    renderWithTheme(
      <Segmented ariaLabel="Background" value="ink" onChange={onChange}
        options={[{ value: "void", label: "Void" }, { value: "ink", label: "Ink" }, { value: "paper", label: "Paper" }]} />
    );
    expect(screen.getByRole("radio", { name: "Ink" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "Paper" }));
    expect(onChange).toHaveBeenCalledWith("paper");
  });
});

describe("Chip", () => {
  it("exposes pressed state", () => {
    const onClick = jest.fn();
    renderWithTheme(<Chip selected onClick={onClick}>Fractals</Chip>);
    const chip = screen.getByRole("button", { name: "Fractals" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(chip);
    expect(onClick).toHaveBeenCalled();
  });
});
