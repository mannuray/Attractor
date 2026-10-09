import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { themes } from "../theme/themes";

const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={themes.cyber_cyan.colors}>{children}</ThemeProvider>
);

// Uses `wrapper` so rerender() keeps the theme.
export function renderWithTheme(ui: React.ReactElement) {
  return render(ui, { wrapper: Wrapper });
}
