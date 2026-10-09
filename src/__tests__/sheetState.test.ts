import { sheetReducer, initialSheet } from "../lib/sheetState";

describe("sheetReducer", () => {
  it("starts collapsed on params", () => {
    expect(initialSheet).toEqual({ expanded: false, tab: "params" });
  });

  it("tapping a tab while collapsed expands to that tab", () => {
    expect(sheetReducer(initialSheet, { type: "tapTab", tab: "color" }))
      .toEqual({ expanded: true, tab: "color" });
  });

  it("tapping the active tab while expanded collapses", () => {
    const open = { expanded: true, tab: "color" as const };
    expect(sheetReducer(open, { type: "tapTab", tab: "color" }))
      .toEqual({ expanded: false, tab: "color" });
  });

  it("tapping another tab while expanded switches tab and stays open", () => {
    const open = { expanded: true, tab: "color" as const };
    expect(sheetReducer(open, { type: "tapTab", tab: "system" }))
      .toEqual({ expanded: true, tab: "system" });
  });

  it("toggle / collapse / expand", () => {
    expect(sheetReducer(initialSheet, { type: "toggle" }).expanded).toBe(true);
    expect(sheetReducer({ expanded: true, tab: "params" }, { type: "collapse" }).expanded).toBe(false);
    expect(sheetReducer(initialSheet, { type: "expand" }).expanded).toBe(true);
  });
});
