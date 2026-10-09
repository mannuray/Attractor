// Pure data about every system the app offers (no React), for code that runs outside the
// browser UI: the share-image function, routing middleware and the prerender step.
// Keep in sync with ./index.ts (a test checks parity with the registry).
import type { SystemMeta } from "./registry";
import { symmetricIconMeta } from "./symmetricIcon/meta";
import { symmetricQuiltMeta } from "./symmetricQuilt/meta";
import { cliffordMeta } from "./clifford/meta";
import { deJongMeta } from "./deJong/meta";
import { tinkerbellMeta } from "./tinkerbell/meta";
import { henonMeta } from "./henon/meta";
import { bedheadMeta } from "./bedhead/meta";
import { svenssonMeta } from "./svensson/meta";
import { fractalDreamMeta } from "./fractalDream/meta";
import { hopalongMeta } from "./hopalong/meta";
import { gumowskiMiraMeta } from "./gumowskiMira/meta";
import { sprottMeta } from "./sprott/meta";
import { symmetricFractalMeta } from "./symmetricFractal/meta";
import { deRhamMeta } from "./deRham/meta";
import { conradiMeta } from "./conradi/meta";
import { mobiusMeta } from "./mobius/meta";
import { mandelbrotMeta } from "./mandelbrot/meta";
import { juliaMeta } from "./julia/meta";
import { burningshipMeta } from "./burningship/meta";
import { tricornMeta } from "./tricorn/meta";
import { multibrotMeta } from "./multibrot/meta";
import { newtonMeta } from "./newton/meta";
import { phoenixMeta } from "./phoenix/meta";
import { lyapunovMeta } from "./lyapunov/meta";

export const SYSTEM_CATALOG: SystemMeta[] = [
  symmetricIconMeta,
  symmetricQuiltMeta,
  cliffordMeta,
  deJongMeta,
  tinkerbellMeta,
  henonMeta,
  bedheadMeta,
  svenssonMeta,
  fractalDreamMeta,
  hopalongMeta,
  gumowskiMiraMeta,
  sprottMeta,
  symmetricFractalMeta,
  deRhamMeta,
  conradiMeta,
  mobiusMeta,
  mandelbrotMeta,
  juliaMeta,
  burningshipMeta,
  tricornMeta,
  multibrotMeta,
  newtonMeta,
  phoenixMeta,
  lyapunovMeta,
];

export function getSystemMeta(id: string): SystemMeta | undefined {
  return SYSTEM_CATALOG.find(s => s.id === id);
}
