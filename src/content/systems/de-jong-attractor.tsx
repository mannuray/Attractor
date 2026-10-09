import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorContent, AttractorHeader, AttractorName, GalleryImage, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// De Jong Attractors — moved verbatim from the Help & About page.
export default function DeJongAttractor() {
  return (
    <>
      <AttractorCard>
        <AttractorHeader>
          <AttractorName>De Jong Attractors</AttractorName>
          <GalleryImage src="/gallery/dejong.png" alt="De Jong Attractor" />
        </AttractorHeader>
        <AttractorContent>
          <Paragraph>
            Named after Peter de Jong of Phillips Laboratories, this attractor was first
            published in the "Computer Recreations" column of Scientific American in July 1987.
            It has since become a favorite among fractal artists and mathematicians alike.
          </Paragraph>
          <SubTitle>The Equations</SubTitle>
          <Paragraph>
            Similar to the Clifford attractor but using subtraction, creating distinctly
            different visual characteristics:
          </Paragraph>
          <MathBlock>
            <BlockMath math="x_{n+1} = \sin(a \cdot y_n) - \cos(b \cdot x_n)" />
            <BlockMath math="y_{n+1} = \sin(c \cdot x_n) - \cos(d \cdot y_n)" />
          </MathBlock>
          <SubTitle>Bounded Dynamics</SubTitle>
          <Paragraph>
            The attractor is bounded by a circle of radius 2 centered at the origin. All
            trajectories remain within the region <InlineMath math="[-2, 2] \times [-2, 2]" />.
            The De Jong attractor has found applications in cryptography, where its chaotic
            sensitivity to parameters makes it useful for image encryption schemes.
          </Paragraph>
          <SubTitle>Parameter Guide</SubTitle>
          <Paragraph>
            <strong>All parameters (a, b, c, d):</strong> Work well in the range <strong>-3 to +3</strong>,
            though the most interesting patterns typically emerge with values between -2.5 and 2.5.
            The starting point (x₀, y₀) doesn't matter—the attractor converges to the same shape.
          </Paragraph>
          <Paragraph>
            <strong>What to expect:</strong> Random parameters produce four types of behavior:
            (1) <em>Chaos</em>—scattered noise, not interesting; (2) <em>Convergence</em>—points
            collapse to a few locations; (3) <em>Divergence</em>—points escape (rare with this
            bounded system); (4) <em>Strange attractor</em>—the intricate loopy patterns we want.
          </Paragraph>
          <SubTitle>Example Parameter Sets</SubTitle>
          <MathBlock>
            <BlockMath math="a=-2.24,\ b=0.43,\ c=-0.65,\ d=-2.43 \quad \text{(Classic)}" />
            <BlockMath math="a=1.4,\ b=-2.3,\ c=2.4,\ d=-2.1 \quad \text{(Swirl)}" />
            <BlockMath math="a=2.01,\ b=-2.53,\ c=1.61,\ d=-0.33 \quad \text{(Flower)}" />
          </MathBlock>
          <SubTitle>Exploration Tips</SubTitle>
          <Paragraph>
            Finding beautiful De Jong attractors is a "hunting expedition"—try random parameters,
            then make small adjustments when you find something promising. With four 32-bit
            parameters, the odds of anyone else finding the exact same pattern are approximately
            1 in 2¹²⁸—each discovery is likely unique in human history.
          </Paragraph>
          <ParamList>
            <ParamBadge>a: -3 to 3</ParamBadge>
            <ParamBadge>b: -3 to 3</ParamBadge>
            <ParamBadge>c: -3 to 3</ParamBadge>
            <ParamBadge>d: -3 to 3</ParamBadge>
          </ParamList>
        </AttractorContent>
      </AttractorCard>
    </>
  );
}
