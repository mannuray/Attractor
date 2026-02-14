import { AttractorType } from "../attractors/shared/types";

interface IteratorConfigEntry {
  workerName: string;
  paramKeys: string[];
  extraFields?: string[];
  hasScale: boolean;
}

export const ITERATOR_CONFIG: Record<AttractorType, IteratorConfigEntry> = {
  symmetric_icon: {
    workerName: "symmetric_icon",
    paramKeys: ["alpha", "betha", "gamma", "delta", "omega", "lambda", "degree", "npdegree"],
    hasScale: true,
  },
  symmetric_quilt: {
    workerName: "symmetric_quilt",
    paramKeys: ["lambda", "alpha", "beta", "gamma", "omega", "m", "shift"],
    hasScale: true,
  },
  clifford: {
    workerName: "clifford_iterator",
    paramKeys: ["alpha", "beta", "gamma", "delta"],
    hasScale: true,
  },
  dejong: {
    workerName: "dejong_iterator",
    paramKeys: ["alpha", "beta", "gamma", "delta"],
    hasScale: true,
  },
  tinkerbell: {
    workerName: "tinkerbell_iterator",
    paramKeys: ["alpha", "beta", "gamma", "delta"],
    hasScale: true,
  },
  henon: {
    workerName: "henon_iterator",
    paramKeys: ["alpha", "beta"],
    hasScale: true,
  },
  bedhead: {
    workerName: "bedhead_iterator",
    paramKeys: ["alpha", "beta"],
    hasScale: true,
  },
  svensson: {
    workerName: "svensson_iterator",
    paramKeys: ["alpha", "beta", "gamma", "delta"],
    hasScale: true,
  },
  fractal_dream: {
    workerName: "fractal_dream_iterator",
    paramKeys: ["alpha", "beta", "gamma", "delta"],
    hasScale: true,
  },
  hopalong: {
    workerName: "hopalong_iterator",
    paramKeys: ["alpha", "beta", "gamma"],
    hasScale: true,
  },
  gumowski_mira: {
    workerName: "gumowski_mira_iterator",
    paramKeys: ["mu", "alpha", "sigma"],
    hasScale: true,
  },
  sprott: {
    workerName: "sprott_iterator",
    paramKeys: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10", "a11", "a12"],
    hasScale: true,
  },
  symmetric_fractal: {
    workerName: "symmetric_fractal_iterator",
    paramKeys: ["a", "b", "c", "d", "alpha", "beta", "p", "reflect"],
    hasScale: true,
  },
  derham: {
    workerName: "derham_iterator",
    paramKeys: ["alpha", "beta", "curveType"],
    hasScale: true,
  },
  conradi: {
    workerName: "conradi_iterator",
    paramKeys: ["r1", "theta1", "r2", "theta2", "a", "n", "variant"],
    hasScale: true,
  },
  mobius: {
    workerName: "mobius_iterator",
    paramKeys: ["aRe", "aIm", "bRe", "bIm", "cRe", "cIm", "dRe", "dIm", "n"],
    hasScale: true,
  },
  jason_rampe1: {
    workerName: "jason_rampe1_iterator",
    paramKeys: ["alpha", "beta", "gamma", "delta"],
    hasScale: true,
  },
  jason_rampe2: {
    workerName: "jason_rampe2_iterator",
    paramKeys: ["alpha", "beta", "gamma", "delta"],
    hasScale: true,
  },
  jason_rampe3: {
    workerName: "jason_rampe3_iterator",
    paramKeys: ["alpha", "beta", "gamma", "delta"],
    hasScale: true,
  },
  mandelbrot: {
    workerName: "mandelbrot",
    paramKeys: ["centerX", "centerY", "zoom", "maxIter"],
    hasScale: false,
  },
  julia: {
    workerName: "julia",
    paramKeys: ["cReal", "cImag", "centerX", "centerY", "zoom", "maxIter"],
    hasScale: false,
  },
  burningship: {
    workerName: "burningship",
    paramKeys: ["centerX", "centerY", "zoom", "maxIter"],
    hasScale: false,
  },
  tricorn: {
    workerName: "tricorn",
    paramKeys: ["centerX", "centerY", "zoom", "maxIter"],
    hasScale: false,
  },
  multibrot: {
    workerName: "multibrot",
    paramKeys: ["centerX", "centerY", "zoom", "maxIter", "power"],
    hasScale: false,
  },
  newton: {
    workerName: "newton",
    paramKeys: ["centerX", "centerY", "zoom", "maxIter"],
    hasScale: false,
  },
  phoenix: {
    workerName: "phoenix",
    paramKeys: ["centerX", "centerY", "zoom", "maxIter", "cReal", "cImag", "p"],
    hasScale: false,
  },
  lyapunov: {
    workerName: "lyapunov",
    paramKeys: ["aMin", "aMax", "bMin", "bMax", "maxIter"],
    extraFields: ["sequence"],
    hasScale: false,
  },
};

export function buildIteratorPayload(
  type: AttractorType,
  params: Record<string, any>
): { name: string; parameters: Record<string, number>; sequence?: string } {
  const config = ITERATOR_CONFIG[type];
  const parameters: Record<string, number> = {};
  for (const key of config.paramKeys) {
    parameters[key] = params[key];
  }

  const result: { name: string; parameters: Record<string, number>; sequence?: string } = {
    name: config.workerName,
    parameters,
  };

  if (config.extraFields) {
    for (const key of config.extraFields) {
      (result as any)[key] = params[key];
    }
  }

  return result;
}

export function getScale(type: AttractorType, params: Record<string, any>): number {
  const config = ITERATOR_CONFIG[type];
  return config.hasScale ? params.scale : 1;
}
