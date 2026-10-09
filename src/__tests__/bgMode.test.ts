import { bgModeOf, bgColorFor } from "../lib/bgMode";

describe("bgMode", () => {
  it("maps black to void and white to paper", () => {
    expect(bgModeOf({ r: 0, g: 0, b: 0 })).toBe("void");
    expect(bgModeOf({ r: 255, g: 255, b: 255 })).toBe("paper");
  });

  it("treats any other color as ink, so a theme switch keeps Ink selected", () => {
    expect(bgModeOf(bgColorFor("ink", "#05070a"))).toBe("ink");
    expect(bgModeOf(bgColorFor("ink", "#121214"))).toBe("ink");
  });

  it("produces colors for each mode", () => {
    expect(bgColorFor("void", "#05070a")).toEqual({ r: 0, g: 0, b: 0 });
    expect(bgColorFor("paper", "#05070a")).toEqual({ r: 255, g: 255, b: 255 });
    expect(bgColorFor("ink", "#05070a")).toEqual({ r: 5, g: 7, b: 10 });
  });

  it("falls back to near-black ink when the hex is invalid", () => {
    expect(bgModeOf(bgColorFor("ink", "not-a-color"))).toBe("ink");
  });
});
