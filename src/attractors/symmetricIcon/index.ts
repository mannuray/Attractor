import { registry } from "../registry";
import { SymmetricIconControls } from "./Controls";
import { SymmetricIconParams } from "./types";
import { DEFAULT_SYMMETRIC_ICON } from "./config";

export * from "./types";
export * from "./config";
export { SymmetricIconControls };

registry.register({
  id: "symmetric_icon",
  label: "Symmetric Icon",
  category: "Attractors",
  defaultParams: DEFAULT_SYMMETRIC_ICON as SymmetricIconParams,
  Controls: SymmetricIconControls,
  workerIteratorName: "symmetric_icon",
  math: `
const xpos = p[0], ypos = p[1];
const zzbar = xpos * xpos + ypos * ypos;
let zz, zc = 0, zd = 0, zreal, zimag, za, zb, zn;

if (params.delta !== 0) {
  zz = Math.sqrt(zzbar);
  zc = 1; zd = 0;
  zreal = xpos / zz; zimag = ypos / zz;
  for (let j = 0; j < params.npdegree * params.degree; j++) {
    za = zc * zreal - zd * zimag;
    zb = zd * zreal + zc * zimag;
    zc = za; zd = zb;
  }
} else {
  zz = 0;
}

zreal = xpos; zimag = ypos;
for (let i = 0; i < params.degree - 2; i++) {
  za = zreal * xpos - zimag * ypos;
  zb = zimag * xpos + zreal * ypos;
  zreal = za; zimag = zb;
}

zn = xpos * zreal - ypos * zimag;
const factor = params.lambda + params.alpha * zzbar + params.betha * zn + params.delta * zz * zc;

p[0] = factor * xpos + params.gamma * zreal - params.omega * ypos;
p[1] = factor * ypos - params.gamma * zimag + params.omega * xpos;
`
});
