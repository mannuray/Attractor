import fs from "fs";
import path from "path";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider as AppThemeProvider } from "../theme/ThemeContext";
import Info from "../view/pages/Info";

// Giscus loads a third-party iframe; the content guard only needs to know it is mounted.
jest.mock("../components/GiscusComments", () => ({ GiscusComments: () => <div data-testid="giscus" /> }));

const fixture = (name: string) =>
  fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8").split("\n").map(s => s.trim()).filter(Boolean);

// Baseline captured from the docs page before the redesign. Redesigning must not lose content.
const IMAGES = fixture("info-images.txt").map(l => l.replace(/^src="|"$/g, ""));
const NAMES = fixture("info-names.txt");
const SECTIONS = fixture("info-sections.txt");

const renderInfo = () =>
  render(<MemoryRouter><AppThemeProvider><Info /></AppThemeProvider></MemoryRouter>);

describe("Help & About keeps all of its content", () => {
  beforeAll(() => { Element.prototype.scrollIntoView = jest.fn(); });

  it("has the full baseline inventory", () => {
    expect(IMAGES).toHaveLength(34);
    expect(NAMES).toHaveLength(25);
    expect(SECTIONS).toHaveLength(12);
  });

  it("renders every image", () => {
    const { container } = renderInfo();
    const srcs = new Set(Array.from(container.querySelectorAll("img")).map(i => i.getAttribute("src")));
    for (const src of IMAGES) expect(srcs).toContain(src);
  });

  it("renders every system entry", () => {
    renderInfo();
    for (const name of NAMES) expect(screen.getAllByText(name, { exact: false }).length).toBeGreaterThan(0);
  });

  it("renders every section, including the community comments", () => {
    renderInfo();
    for (const title of SECTIONS) expect(screen.getAllByText(title, { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByTestId("giscus")).toBeInTheDocument();
  });

  it("images load lazily so the long page stays fast", () => {
    const { container } = renderInfo();
    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs.every(i => i.getAttribute("loading") === "lazy")).toBe(true);
  });

  it("Getting started describes the controls that actually exist", () => {
    const { container } = renderInfo();
    const steps = Array.from(container.querySelectorAll("ol li")).map(li => li.textContent || "").join("\n");
    expect(steps).not.toMatch(/Parameters tab|Effects tab|Color tab and click Edit|LUT button|OUT button|sidebar/);
    expect(steps).toMatch(/Parameters card/);
    expect(steps).toMatch(/Edit palette/);
  });
});

