import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider as AppThemeProvider } from "../theme/ThemeContext";
import Info from "../view/pages/Info";

jest.mock("../components/GiscusComments", () => ({ GiscusComments: () => <div data-testid="giscus" /> }));

describe("Help rail", () => {
  beforeAll(() => { Element.prototype.scrollIntoView = jest.fn(); });

  it("keeps a clicked section highlighted until the user scrolls themselves", () => {
    render(<MemoryRouter><AppThemeProvider><Info /></AppThemeProvider></MemoryRouter>);
    const rail = screen.getByRole("navigation", { name: "Documentation" });
    fireEvent.click(within(rail).getByRole("button", { name: "About & credits" }));
    // Smooth scroll fires scroll events; a short last section can't reach the top.
    fireEvent.scroll(window);
    expect(within(rail).getByRole("button", { name: "About & credits" })).toHaveAttribute("aria-current", "true");
    // A real user scroll releases the lock and tracking resumes.
    fireEvent.wheel(window);
    fireEvent.scroll(window);
    expect(within(rail).getByRole("button", { name: "About & credits" })).not.toHaveAttribute("aria-current");
  });
});
