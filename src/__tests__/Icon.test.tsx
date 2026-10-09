import { render } from "@testing-library/react";
import { Icon } from "../components/ui/Icon";

describe("Icon", () => {
  it("renders the Material Symbols glyph for a mapped name, hidden from assistive tech", () => {
    const { container } = render(<Icon name="sparkle" size={16} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("material-symbols-outlined");
    expect(el.textContent).toBe("auto_awesome");
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.style.fontSize).toBe("16px");
  });

  it("passes Material glyph names straight through", () => {
    const { container } = render(<Icon name="all_inclusive" />);
    expect(container.textContent).toBe("all_inclusive");
  });
});
