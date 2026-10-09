import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorName, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Newton Fractal — moved verbatim from the Help & About page.
export default function NewtonFractal() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Newton Fractal</AttractorName>
        <Paragraph>
          Newton fractals arise from applying Newton's root-finding method to complex
          polynomials. The method converges to different roots depending on the starting
          point, and the boundaries between these "basins of attraction" form intricate
          fractal patterns—Julia sets, in fact.
        </Paragraph>
        <SubTitle>Newton's Method</SubTitle>
        <Paragraph>
          To find roots of <InlineMath math="f(z)" />, Newton's method iterates:
        </Paragraph>
        <MathBlock>
          <BlockMath math="z_{n+1} = z_n - \frac{f(z_n)}{f'(z_n)}" />
          <BlockMath math="\text{for polynomial } f(z) = z^n - 1" />
        </MathBlock>
        <SubTitle>Basins of Attraction</SubTitle>
        <Paragraph>
          For <InlineMath math="f(z) = z^3 - 1" />, there are three roots (cube roots
          of unity). Each starting point converges to one of these roots—we color by
          which root and how fast. The boundaries between basins have fractal structure,
          first studied by Arthur Cayley in 1879, who found that even for cubic
          polynomials, the basins have infinitely complex boundaries.
        </Paragraph>
        <SubTitle>Parameter Guide</SubTitle>
        <Paragraph>
          <strong>Power (n):</strong> Determines the polynomial <InlineMath math="z^n - 1" />.
          Range typically <strong>3 to 12</strong>. Each power n creates n roots equally spaced
          around the unit circle. Higher powers create more colors (basins) and more complex
          boundary structures.
        </Paragraph>
        <Paragraph>
          • <strong>n = 3:</strong> Three-fold symmetry, the classic Newton fractal.
        </Paragraph>
        <Paragraph>
          • <strong>n = 4:</strong> Four basins with square symmetry.
        </Paragraph>
        <Paragraph>
          • <strong>n = 5-8:</strong> Increasingly intricate patterns with more arms.
        </Paragraph>
        <SubTitle>Coloring</SubTitle>
        <Paragraph>
          Each root gets its own color (the "basin"). The shade within each basin shows
          convergence speed—darker means faster convergence, lighter means more iterations
          were needed. The fractal structure appears only at the boundaries where basins meet.
        </Paragraph>
        <SubTitle>Where to Look</SubTitle>
        <Paragraph>
          The most interesting regions are the <strong>basin boundaries</strong>—zoom into
          any junction where colors meet. The origin (0, 0) is often a good starting point.
          Boundaries have infinite complexity; zooming reveals ever-finer interweaving of colors.
        </Paragraph>
        <ParamList>
          <ParamBadge>power: 3 to 12</ParamBadge>
          <ParamBadge>zoom: 0.5 to 1000+</ParamBadge>
          <ParamBadge>maxIter: 20 to 500</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
