import { screen } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { ParameterGrid } from "../attractors/shared/styles";

describe("ParameterGrid", () => {
  it("renders as a titled Parameters card around its rows", () => {
    renderWithTheme(<ParameterGrid><div>row</div></ParameterGrid>);
    expect(screen.getByRole("group", { name: "Parameters" })).toHaveTextContent("row");
  });
});
