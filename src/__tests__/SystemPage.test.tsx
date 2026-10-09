import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider as AppThemeProvider } from "../theme/ThemeContext";
import SystemPage from "../view/pages/SystemPage";
import Info from "../view/pages/Info";

jest.mock("../components/GiscusComments", () => ({ GiscusComments: () => null }));

const at = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppThemeProvider>
        <Routes>
          <Route path="/systems/:slug" element={<SystemPage />} />
          <Route path="/info" element={<Info />} />
        </Routes>
      </AppThemeProvider>
    </MemoryRouter>
  );

describe("system page", () => {
  beforeAll(() => { Element.prototype.scrollIntoView = jest.fn(); });

  it("shows the write-up under its own H1 with breadcrumb and an Open in studio link", () => {
    at("/systems/clifford-attractor");
    expect(screen.getByRole("heading", { level: 1, name: "Clifford Attractors" })).toBeInTheDocument();
    expect(screen.getAllByText(/Chaos in Wonderland/).length).toBeGreaterThan(0);
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumbs).getByRole("link", { name: "Help & About" })).toHaveAttribute("href", "/info");
    expect(screen.getByRole("link", { name: /Open in studio/ })).toHaveAttribute("href", "/?type=clifford");
  });

  it("links up to four related systems from the same group, not itself", () => {
    at("/systems/clifford-attractor");
    const related = within(screen.getByRole("navigation", { name: "Related systems" })).getAllByRole("link");
    expect(related.length).toBeGreaterThan(0);
    expect(related.length).toBeLessThanOrEqual(4);
    related.forEach(a => {
      expect(a.getAttribute("href")).toMatch(/^\/systems\/[a-z0-9-]+$/);
      expect(a.getAttribute("href")).not.toBe("/systems/clifford-attractor");
    });
  });

  it("has no Open in studio link for write-ups the studio doesn't offer", () => {
    at("/systems/jason-rampe-attractors");
    expect(screen.getByRole("heading", { level: 1, name: "Jason Rampe Attractors (1, 2, 3)" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open in studio/ })).toBeNull();
  });

  it("unknown slug shows the 404 page", () => {
    at("/systems/nope");
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("Help & About links each write-up to its page", () => {
    // Direct DOM query: role queries compute styles across the whole long page, which jsdom can't handle.
    const { container } = at("/info");
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[aria-label^="Open the "]'));
    expect(links).toHaveLength(25);
    const clifford = links.find(a => a.getAttribute("aria-label") === "Open the Clifford Attractors page");
    expect(clifford).toHaveAttribute("href", "/systems/clifford-attractor");
  });
});
