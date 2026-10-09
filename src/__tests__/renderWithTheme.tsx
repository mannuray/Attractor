import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { themes } from "../theme/themes";

export function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={themes.cyber_cyan.colors}>{ui}</ThemeProvider>);
}
