import { render } from "@testing-library/react";
import { Icon } from "../components/ui/Icon";

describe("Icon", () => {
  it("renders the Material Symbols glyph from an attribute, so the glyph name never becomes page text", () => {
    const { container } = render(<Icon name="sparkle" size={16} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("material-symbols-outlined");
    expect(el.getAttribute("data-icon")).toBe("auto_awesome");
    expect(el.textContent).toBe("");
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.style.fontSize).toBe("16px");
  });

  it("passes Material glyph names straight through", () => {
    const { container } = render(<Icon name="all_inclusive" />);
    expect(container.firstElementChild!.getAttribute("data-icon")).toBe("all_inclusive");
  });
});
