import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import "../attractors";
import { Inspector } from "../components/shell/Inspector";
import { makeShellProps } from "./shellProps";

describe("Inspector", () => {
  it("shows the selected tab's panel", () => {
    const onTabChange = jest.fn();
    const { rerender } = renderWithTheme(
      <Inspector {...makeShellProps()} collapsed={false} onToggleCollapse={() => {}} tab="params" onTabChange={onTabChange} />
    );
    expect(screen.getByTestId("controls")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Color" }));
    expect(onTabChange).toHaveBeenCalledWith("color");
    rerender(<Inspector {...makeShellProps()} collapsed={false} onToggleCollapse={() => {}} tab="color" onTabChange={onTabChange} />);
    expect(screen.getByRole("radiogroup", { name: "Background" })).toBeInTheDocument();
  });

  it("has all five tabs", () => {
    renderWithTheme(<Inspector {...makeShellProps()} collapsed={false} onToggleCollapse={() => {}} tab="params" onTabChange={() => {}} />);
    for (const name of ["System", "Parameters", "Render", "Color", "Effects"]) {
      expect(screen.getByRole("tab", { name })).toBeInTheDocument();
    }
  });

  it("collapsed: hides panel content, keeps expand control", () => {
    const onToggle = jest.fn();
    renderWithTheme(<Inspector {...makeShellProps()} collapsed onToggleCollapse={onToggle} tab="params" onTabChange={() => {}} />);
    expect(screen.queryByTestId("controls")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Expand inspector" }));
    expect(onToggle).toHaveBeenCalled();
  });
});
