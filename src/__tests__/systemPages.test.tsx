import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { themes } from "../theme/themes";
import { SYSTEM_PAGES, getSystemPage, systemPageFor } from "../content/systemPages";
import { SYSTEM_CATALOG } from "../attractors/catalog";
import cardText from "./fixtures/system-card-text.json";

describe("system pages", () => {
  it("has one page per write-up with unique, URL-safe slugs", () => {
    expect(SYSTEM_PAGES).toHaveLength(25);
    const slugs = SYSTEM_PAGES.map(p => p.slug);
    expect(new Set(slugs).size).toBe(25);
    slugs.forEach(s => expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
    expect(SYSTEM_PAGES.map(p => p.title)).toEqual(Object.keys(cardText));
  });

  it("covers every system in the studio exactly once", () => {
    const ids = SYSTEM_PAGES.flatMap(p => p.systemIds);
    for (const s of SYSTEM_CATALOG) expect(ids.filter(i => i === s.id)).toHaveLength(1);
    expect(systemPageFor("clifford")?.slug).toBe("clifford-attractor");
    expect(getSystemPage("mandelbrot-set")?.title).toBe("Mandelbrot Set");
    expect(getSystemPage("nope")).toBeUndefined();
  });

  it("has search-friendly descriptions", () => {
    for (const p of SYSTEM_PAGES) {
      expect(p.description.length).toBeGreaterThanOrEqual(50);
      expect(p.description.length).toBeLessThanOrEqual(155);
    }
  });

  it.each(Object.entries(cardText))("%s page body is the original card, unchanged", (title, text) => {
    const page = SYSTEM_PAGES.find(p => p.title === title)!;
    const { container } = render(<ThemeProvider theme={themes.cyber_cyan.colors}><page.Body /></ThemeProvider>);
    expect(container.textContent).toBe(text);
  });
});
