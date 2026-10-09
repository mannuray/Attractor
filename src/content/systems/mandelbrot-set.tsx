import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorName, GridImage, ImageGrid, ImageLabel, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Mandelbrot Set — moved verbatim from the Help & About page.
export default function MandelbrotSet() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Mandelbrot Set</AttractorName>
        <Paragraph>
          The most famous fractal in mathematics, first visualized by Benoit Mandelbrot
          on March 1, 1980, at IBM's Watson Research Center. The Mandelbrot set has been
          called "the most complex object in mathematics" and serves as a master catalog
          of dynamical systems—connecting to number theory, topology, algebraic geometry,
          and even physics.
        </Paragraph>
        <ImageGrid>
          <div><GridImage src="/gallery/mandelbrot.png" alt="Classic" /><ImageLabel>Classic</ImageLabel></div>
          <div><GridImage src="/gallery/mandelbrot-fire.png" alt="Fire" /><ImageLabel>Fire</ImageLabel></div>
          <div><GridImage src="/gallery/mandelbrot-spiral-galaxy.png" alt="Spiral Galaxy" /><ImageLabel>Spiral Galaxy</ImageLabel></div>
          <div><GridImage src="/gallery/mandelbrot-deep-zoom.png" alt="Deep Zoom" /><ImageLabel>Deep Zoom</ImageLabel></div>
          <div><GridImage src="/gallery/mandelbrot-electric.png" alt="Electric" /><ImageLabel>Electric</ImageLabel></div>
        </ImageGrid>
        <SubTitle>The Iteration</SubTitle>
        <Paragraph>
          For each point <InlineMath math="c" /> in the complex plane, we iterate
          the deceptively simple quadratic polynomial:
        </Paragraph>
        <MathBlock>
          <BlockMath math="z_{n+1} = z_n^2 + c" />
          <BlockMath math="\text{Starting with } z_0 = 0" />
        </MathBlock>
        <SubTitle>The Escape-Time Algorithm</SubTitle>
        <Paragraph>
          The Mandelbrot set consists of all values of <InlineMath math="c" /> for which
          the orbit of 0 remains bounded (never escapes to infinity). Mathematically,
          if <InlineMath math="|z_n| > 2" /> at any point, the sequence will escape to
          infinity. We color each pixel by counting iterations before escape—this is
          the "escape time" algorithm. Points that never escape (the set itself) are
          traditionally colored black.
        </Paragraph>
        <SubTitle>Navigation Guide</SubTitle>
        <Paragraph>
          <strong>Overview:</strong> The main cardioid (heart shape) is centered
          near <InlineMath math="(-0.5, 0)" /> with the circular "head" to the left
          around <InlineMath math="(-1, 0)" />.
        </Paragraph>
        <Paragraph>
          <strong>Interesting Zoom Locations:</strong>
        </Paragraph>
        <Paragraph>
          • <strong>Seahorse Valley:</strong> <InlineMath math="(-0.75, 0.1)" /> — Named
          for its spiral seahorse-like structures. One of the most visually rich regions.
        </Paragraph>
        <Paragraph>
          • <strong>Elephant Valley:</strong> <InlineMath math="(0.275, 0.0)" /> — Between
          the main cardioid and the circular head, featuring elephant trunk shapes.
        </Paragraph>
        <Paragraph>
          • <strong>Lightning:</strong> <InlineMath math="(-1.25, 0.02)" /> — The "antenna"
          region on the left, with delicate lightning bolt structures.
        </Paragraph>
        <Paragraph>
          • <strong>Mini-Mandelbrots:</strong> Found throughout the boundary, especially
          in the antenna. Zoom 10x+ anywhere on the boundary to find embedded copies.
        </Paragraph>
        <Paragraph>
          • <strong>Spiral Arms:</strong> <InlineMath math="(-0.761574, -0.0847596)" /> —
          The Fibonacci spirals visible at the junction between cardioid and head.
        </Paragraph>
        <SubTitle>Iteration Guide</SubTitle>
        <Paragraph>
          <strong>maxIter (Maximum Iterations):</strong> Determines detail level and
          rendering time. Use 100-500 for overview, 500-2000 for moderate zoom, and
          5000+ for deep zooms. Higher iterations reveal finer boundary detail but
          slow rendering.
        </Paragraph>
        <SubTitle>Technical Limits</SubTitle>
        <Paragraph>
          Standard 64-bit floating point allows zooming to about 10¹⁴× magnification.
          Beyond this, numerical precision limits create blocky artifacts. The mathematics
          continues infinitely, but visualization requires specialized "arbitrary precision"
          software for deeper exploration.
        </Paragraph>
        <ParamList>
          <ParamBadge>centerX: -2.5 to 1</ParamBadge>
          <ParamBadge>centerY: -1.5 to 1.5</ParamBadge>
          <ParamBadge>zoom: 0.5 to 10¹⁴</ParamBadge>
          <ParamBadge>maxIter: 100 to 10000+</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
