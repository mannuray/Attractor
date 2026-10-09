// One documentation page per system write-up. The bodies are the Help & About cards,
// moved verbatim; this file adds what each standalone page needs (URL, search description).
import type React from "react";
import type { AttractorType } from "../attractors/shared/types";
import SymmetricIcons from "./systems/symmetric-icons";
import SymmetricQuilts from "./systems/symmetric-quilts";
import CliffordAttractor from "./systems/clifford-attractor";
import DeJongAttractor from "./systems/de-jong-attractor";
import SvenssonAttractor from "./systems/svensson-attractor";
import BedheadAttractor from "./systems/bedhead-attractor";
import FractalDreamAttractor from "./systems/fractal-dream-attractor";
import HopalongAttractor from "./systems/hopalong-attractor";
import GumowskiMiraAttractor from "./systems/gumowski-mira-attractor";
import SprottAttractor from "./systems/sprott-attractor";
import TinkerbellMap from "./systems/tinkerbell-map";
import HenonAttractor from "./systems/henon-attractor";
import JasonRampeAttractors from "./systems/jason-rampe-attractors";
import SymmetricFractals from "./systems/symmetric-fractals";
import DeRhamCurves from "./systems/de-rham-curves";
import ConradiAttractor from "./systems/conradi-attractor";
import MobiusAttractor from "./systems/mobius-attractor";
import MandelbrotSet from "./systems/mandelbrot-set";
import JuliaSets from "./systems/julia-sets";
import BurningShipFractal from "./systems/burning-ship-fractal";
import TricornFractal from "./systems/tricorn-fractal";
import MultibrotSet from "./systems/multibrot-set";
import NewtonFractal from "./systems/newton-fractal";
import PhoenixFractal from "./systems/phoenix-fractal";
import LyapunovFractal from "./systems/lyapunov-fractal";

export type SystemGroup = "attractors" | "ifs" | "fractals";

export interface SystemPage {
  slug: string;
  /** Card heading, verbatim. */
  title: string;
  group: SystemGroup;
  /** Studio systems this page describes (empty if none is available in the studio). */
  systemIds: AttractorType[];
  /** Search snippet, ≤155 characters, drawn from the card's own text. */
  description: string;
  /** Representative image (site-relative), if the write-up has one. */
  image?: string;
  Body: React.FC;
}

export const GROUP_LABELS: Record<SystemGroup, string> = {
  attractors: "Attractors",
  ifs: "IFS systems",
  fractals: "Fractals",
};

export const SYSTEM_PAGES: SystemPage[] = [
  { slug: "symmetric-icons", title: "Symmetric Icons", group: "attractors", systemIds: ["symmetric_icon"],
    description: "Symmetric icons from Field and Golubitsky's \"Symmetry in Chaos\": chaotic maps that draw perfectly symmetric patterns. Formula, gallery and generator.",
    image: "/gallery/symmetric-icon-fuzzy-hex-knot.png", Body: SymmetricIcons },
  { slug: "symmetric-quilts", title: "Symmetric Quilts", group: "attractors", systemIds: ["symmetric_quilt"],
    description: "Symmetric quilts tile the plane with chaotic wallpaper patterns, extending Field and Golubitsky's icons. See the math, examples and make your own.",
    image: "/gallery/symmetric-quilt-mosque.png", Body: SymmetricQuilts },
  { slug: "clifford-attractor", title: "Clifford Attractors", group: "attractors", systemIds: ["clifford"],
    description: "The Clifford attractor from Pickover's \"Chaos in Wonderland\": its equations, parameter guide and gallery, plus a free online generator.",
    image: "/gallery/clifford.png", Body: CliffordAttractor },
  { slug: "de-jong-attractor", title: "De Jong Attractors", group: "attractors", systemIds: ["dejong"],
    description: "Peter de Jong's attractor, first published in Scientific American (1987): equations, parameters and gallery, with a free online generator.",
    image: "/gallery/dejong.png", Body: DeJongAttractor },
  { slug: "svensson-attractor", title: "Svensson Attractors", group: "attractors", systemIds: ["svensson"],
    description: "Johnny Svensson's variation of the De Jong attractor that draws flowing, ribbon-like patterns. Equations, examples and an online generator.",
    image: "/gallery/svensson.png", Body: SvenssonAttractor },
  { slug: "bedhead-attractor", title: "Bedhead Attractors", group: "attractors", systemIds: ["bedhead"],
    description: "The Bedhead attractor draws organic, hair-like strands from just two parameters. See its equations and examples, and render your own online.",
    image: "/gallery/bedhead.png", Body: BedheadAttractor },
  { slug: "fractal-dream-attractor", title: "Fractal Dream Attractors", group: "attractors", systemIds: ["fractal_dream"],
    description: "Pickover's Fractal Dream attractor makes ethereal, dreamlike curves. Its equations, parameter behaviour and gallery, plus a free generator.",
    image: "/gallery/fractal-dream.png", Body: FractalDreamAttractor },
  { slug: "hopalong-attractor", title: "Hopalong Attractors", group: "attractors", systemIds: ["hopalong"],
    description: "Barry Martin's Hopalong (Martin) attractor, popularised by Scientific American in 1986: equations, examples and a free online generator.",
    image: "/gallery/hopalong.png", Body: HopalongAttractor },
  { slug: "gumowski-mira-attractor", title: "Gumowski-Mira Attractors", group: "attractors", systemIds: ["gumowski_mira"],
    description: "The Gumowski-Mira map, created at CERN in 1980 to model particle paths, draws butterfly and flower patterns. Equations and online generator.",
    image: "/gallery/gumowski-mira.png", Body: GumowskiMiraAttractor },
  { slug: "sprott-attractor", title: "Sprott Attractors", group: "attractors", systemIds: ["sprott"],
    description: "J.C. Sprott's 12-parameter quadratic map, searched automatically for chaos using its Lyapunov exponent. See the equations and explore it online.",
    Body: SprottAttractor },
  { slug: "tinkerbell-map", title: "Tinkerbell Map", group: "attractors", systemIds: ["tinkerbell"],
    description: "The Tinkerbell map: a chaotic system with period-doubling and Hopf bifurcations, named after Peter Pan's fairy. Equations and generator.",
    image: "/gallery/tinkerbell.png", Body: TinkerbellMap },
  { slug: "henon-attractor", title: "Hénon Attractor", group: "attractors", systemIds: ["henon"],
    description: "Michel Hénon's 1976 map, the simplest system with a strange attractor: its history, equations and parameters, with a free online generator.",
    image: "/thumbnails/henon.png", Body: HenonAttractor },
  { slug: "jason-rampe-attractors", title: "Jason Rampe Attractors (1, 2, 3)", group: "attractors", systemIds: [],
    description: "Three related attractors by Jason Rampe, each combining sine and cosine terms differently to create unique patterns. Equations for all three.",
    Body: JasonRampeAttractors },
  { slug: "symmetric-fractals", title: "Symmetric Fractals", group: "ifs", systemIds: ["symmetric_fractal"],
    description: "Symmetric fractals: an affine iterated function system with random rotations from the Zp or Dp symmetry group. Math, examples and generator.",
    image: "/gallery/symmetric-fractal.png", Body: SymmetricFractals },
  { slug: "de-rham-curves", title: "De Rham Curves", group: "ifs", systemIds: ["derham"],
    description: "De Rham curves, from Georges de Rham: Cesaro (Lévy C) and Koch-Peano curves built from two contracting maps. Formulas and online generator.",
    Body: DeRhamCurves },
  { slug: "conradi-attractor", title: "Conradi Attractors", group: "ifs", systemIds: ["conradi"],
    description: "Simone Conradi's attractors combine complex-number rotations with inversions to create symmetric forms. See the formula and render them online.",
    image: "/gallery/conradi.png", Body: ConradiAttractor },
  { slug: "mobius-attractor", title: "Mobius Attractors", group: "ifs", systemIds: ["mobius"],
    description: "Simone Conradi's Möbius attractor applies a Möbius transformation before a random rotation. The formula, its parameters and an online generator.",
    Body: MobiusAttractor },
  { slug: "mandelbrot-set", title: "Mandelbrot Set", group: "fractals", systemIds: ["mandelbrot"],
    description: "The Mandelbrot set, first visualised by Benoit Mandelbrot in 1980: how it is computed, what its regions mean, and a fast online explorer.",
    image: "/gallery/mandelbrot.png", Body: MandelbrotSet },
  { slug: "julia-sets", title: "Julia Sets", group: "fractals", systemIds: ["julia"],
    description: "Julia sets, named after Gaston Julia (1918): the math behind them, famous shapes like the Dragon and Rabbit, and a free online explorer.",
    image: "/gallery/julia-dragon.png", Body: JuliaSets },
  { slug: "burning-ship-fractal", title: "Burning Ship", group: "fractals", systemIds: ["burningship"],
    description: "The Burning Ship fractal (Michelitsch and Rössler, 1992) takes absolute values before squaring, giving flame-like shapes. Formula and explorer.",
    image: "/thumbnails/burningShip.png", Body: BurningShipFractal },
  { slug: "tricorn-fractal", title: "Tricorn (Mandelbar)", group: "fractals", systemIds: ["tricorn"],
    description: "The Tricorn or Mandelbar set uses complex conjugation, creating three-fold symmetry and horn-like structures. The formula and an online explorer.",
    image: "/thumbnails/tricorn.png", Body: TricornFractal },
  { slug: "multibrot-set", title: "Multibrot", group: "fractals", systemIds: ["multibrot"],
    description: "Multibrot sets generalise the Mandelbrot set to any power d. See how the power changes the shape, the formula, and explore them online.",
    image: "/thumbnails/multibrot.png", Body: MultibrotSet },
  { slug: "newton-fractal", title: "Newton Fractal", group: "fractals", systemIds: ["newton"],
    description: "Newton fractals come from Newton's root-finding method on complex polynomials; their basin boundaries are fractals. The method and an explorer.",
    image: "/thumbnails/newton.png", Body: NewtonFractal },
  { slug: "phoenix-fractal", title: "Phoenix Fractal", group: "fractals", systemIds: ["phoenix"],
    description: "The Phoenix fractal adds a memory term to the Julia formula, producing wing- and feather-like structures. Equation, parameters and explorer.",
    image: "/gallery/phoenix.png", Body: PhoenixFractal },
  { slug: "lyapunov-fractal", title: "Lyapunov Fractal", group: "fractals", systemIds: ["lyapunov"],
    description: "Lyapunov fractals (Mario Markus, late 1980s) map order and chaos in the logistic map. How they are computed, examples and an online generator.",
    image: "/gallery/lyapunov.png", Body: LyapunovFractal },
];

export const getSystemPage = (slug: string) => SYSTEM_PAGES.find(p => p.slug === slug);

export const systemPageFor = (systemId: string) =>
  SYSTEM_PAGES.find(p => (p.systemIds as string[]).includes(systemId));
