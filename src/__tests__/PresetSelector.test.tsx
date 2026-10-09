import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { PresetSelector, PresetSystemContext } from "../attractors/shared/PresetSelector";

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

  it("shows each preset's rendered thumbnail when the system is known", () => {
    const { container } = renderWithTheme(
      <PresetSystemContext.Provider value="clifford">
        <PresetSelector label="Presets" value={0} options={options} onChange={jest.fn()} />
      </PresetSystemContext.Provider>
    );
    const imgs = Array.from(container.querySelectorAll("img"));  // eslint-disable-line testing-library/no-container, testing-library/no-node-access
    expect(imgs.map(i => i.getAttribute("src"))).toEqual(["/presets/clifford/0.webp", "/presets/clifford/1.webp"]);
    expect(imgs[0]).toHaveAttribute("loading", "lazy");
    expect(imgs[0]).toHaveAttribute("alt", "");               // the tile's label names it
  });

  it("falls back to the gradient tile if a thumbnail is missing", () => {
    const { container } = renderWithTheme(
      <PresetSystemContext.Provider value="clifford">
        <PresetSelector label="Presets" value={0} options={options} onChange={jest.fn()} />
      </PresetSystemContext.Provider>
    );
    const img = container.querySelector("img")!;  // eslint-disable-line testing-library/no-container, testing-library/no-node-access
    fireEvent.error(img);
    expect(container.querySelectorAll("img")).toHaveLength(1);  // eslint-disable-line testing-library/no-container, testing-library/no-node-access
  });

  it("keeps the decorative tiles without a system", () => {
    const { container } = renderWithTheme(<PresetSelector label="Presets" value={0} options={options} onChange={jest.fn()} />);
    expect(container.querySelectorAll("img")).toHaveLength(0);  // eslint-disable-line testing-library/no-container, testing-library/no-node-access
  });
});
