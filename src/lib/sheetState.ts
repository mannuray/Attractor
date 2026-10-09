export type SheetTab = "system" | "params" | "color" | "export";
export interface SheetState { expanded: boolean; tab: SheetTab }
export type SheetAction =
  | { type: "tapTab"; tab: SheetTab }
  | { type: "toggle" }
  | { type: "collapse" }
  | { type: "expand" };

export const initialSheet: SheetState = { expanded: false, tab: "params" };

export function sheetReducer(s: SheetState, a: SheetAction): SheetState {
  switch (a.type) {
    case "tapTab":
      if (s.expanded && s.tab === a.tab) return { ...s, expanded: false };
      return { expanded: true, tab: a.tab };
    case "toggle":
      return { ...s, expanded: !s.expanded };
    case "collapse":
      return { ...s, expanded: false };
    case "expand":
      return { ...s, expanded: true };
  }
}
