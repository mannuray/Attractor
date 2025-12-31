import { SymmetricIconParams } from "./types";
import symmetricIconData from "../../Parametersets";
import { CONFIG } from "../shared/types";

// Get initial icon from presets
const initialIcon = symmetricIconData[CONFIG.INITIAL_ICON_INDEX];

export const DEFAULT_SYMMETRIC_ICON: SymmetricIconParams = {
  alpha: initialIcon.alpha,
  betha: initialIcon.betha,
  gamma: initialIcon.gamma,
  delta: initialIcon.delta,
  omega: initialIcon.omega,
  lambda: initialIcon.lambda,
  degree: initialIcon.degree,
  npdegree: initialIcon.npdegree,
  scale: initialIcon.scale,
};
