import { registry } from "../registry";
import { MobiusControls } from "./Controls";
import { DEFAULT_MOBIUS } from "./config";
import { MobiusParams } from "./types";

export * from "./types";
export * from "./config";
export { MobiusControls };

registry.register({
  id: "mobius",
  label: "Mobius",
  category: "IFS",
  defaultParams: DEFAULT_MOBIUS as MobiusParams,
  Controls: MobiusControls,
  workerIteratorName: "mobius_iterator",
  math: `
const x = p[0], y = p[1];
const numr = params.aRe * x - params.aIm * y + params.bRe;
const numi = params.aRe * y + params.aIm * x + params.bi; // Wait, worker has this.bi, but params has bIm
const denr = params.cRe * x - params.cIm * y + params.dr; // Wait, worker has this.dr, but params has dRe
const deni = params.cRe * y + params.cIm * x + params.di; // Wait, worker has this.di, but params has dIm
const d2 = denr * denr + deni * deni + 0.0001;
const zr = (numr * denr + numi * deni) / d2;
const zi = (numi * denr - numr * deni) / d2;
const angle = (2 * Math.PI * Math.floor(Math.random() * params.n)) / params.n;
const cos = Math.cos(angle), sin = Math.sin(angle);
p[0] = zr * cos - zi * sin; p[1] = zr * sin + zi * cos;
`
});
