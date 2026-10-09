import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorName, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Burning Ship — moved verbatim from the Help & About page.
export default function BurningShipFractal() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Burning Ship</AttractorName>
        <Paragraph>
          Discovered in 1992 by Michael Michelitsch and Otto Rössler, the Burning Ship
          fractal applies a small but significant change to the Mandelbrot formula:
          taking absolute values before squaring. This creates angular, flame-like
          structures instead of the smooth curves of the Mandelbrot set.
        </Paragraph>
        <SubTitle>The Equation</SubTitle>
        <MathBlock>
          <BlockMath math="z_{n+1} = (|\text{Re}(z_n)| + i|\text{Im}(z_n)|)^2 + c" />
        </MathBlock>
        <Paragraph>
          The absolute value operation makes the function <strong>non-analytic</strong>
          (not smooth in the complex analysis sense), which removes the curviness and
          creates sharp angles and lines. Traditionally rendered with the imaginary
          axis inverted, the main structure resembles a ship engulfed in flames—hence
          the name. Like the Mandelbrot set, it contains infinitely many embedded
          "mini-ships" at all scales.
        </Paragraph>
        <SubTitle>Navigation Guide</SubTitle>
        <Paragraph>
          <strong>Overview:</strong> The main ship is centered around <InlineMath math="(-0.4, -0.6)" />
          (with y-axis inverted for the traditional view). The "hull" is the large
          dark region, with flames rising above it.
        </Paragraph>
        <Paragraph>
          <strong>Interesting Locations:</strong>
        </Paragraph>
        <Paragraph>
          • <strong>The Ship Hull:</strong> <InlineMath math="(-1.6, 0)" /> — The main
          ship structure with its characteristic angular "burning" appearance.
        </Paragraph>
        <Paragraph>
          • <strong>Mini-Ships:</strong> <InlineMath math="(-1.755, -0.02)" /> — Embedded
          small ships in the "armada" region to the left of the main ship.
        </Paragraph>
        <Paragraph>
          • <strong>Waterline:</strong> Explore along <InlineMath math="y = 0" /> for
          the junction between ship and water, with curving spires.
        </Paragraph>
        <Paragraph>
          • <strong>Antenna:</strong> The right antenna region shows why it's called
          "Burning Ship"—flame-like structures ascending.
        </Paragraph>
        <SubTitle>Visual Character</SubTitle>
        <Paragraph>
          The angular nature produces patterns resembling lace, crosses, Eiffel towers,
          and other "nightmarish" imagery. Deep zooms reveal mini-ships with their own
          fleets of embedded smaller ships. Some regions have been compared to works
          by Van Gogh and Turner.
        </Paragraph>
        <ParamList>
          <ParamBadge>centerX: -2.5 to 1.5</ParamBadge>
          <ParamBadge>centerY: -2 to 1</ParamBadge>
          <ParamBadge>zoom: 0.5 to 10¹⁴</ParamBadge>
          <ParamBadge>maxIter: 100 to 10000+</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
