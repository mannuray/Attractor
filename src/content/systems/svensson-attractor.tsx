import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorContent, AttractorHeader, AttractorName, GalleryImage, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Svensson Attractors — moved verbatim from the Help & About page.
export default function SvenssonAttractor() {
  return (
    <>
      <AttractorCard>
        <AttractorHeader>
          <AttractorName>Svensson Attractors</AttractorName>
          <GalleryImage src="/gallery/svensson.png" alt="Svensson Attractor" />
        </AttractorHeader>
        <AttractorContent>
          <Paragraph>
            Created by Johnny Svensson, this attractor is a variation of the De Jong attractor
            that produces flowing, ribbon-like patterns with striking visual appeal. The key
            difference is in how the parameters multiply the trigonometric terms.
          </Paragraph>
          <SubTitle>The Equations</SubTitle>
          <MathBlock>
            <BlockMath math="x_{n+1} = d \cdot \sin(a \cdot x_n) - \sin(b \cdot y_n)" />
            <BlockMath math="y_{n+1} = c \cdot \cos(a \cdot x_n) + \cos(b \cdot y_n)" />
          </MathBlock>
          <Paragraph>
            Notice that unlike De Jong, the Svensson attractor applies
            parameters <InlineMath math="c" /> and <InlineMath math="d" /> as multipliers
            to the trigonometric terms rather than inside them. This subtle change produces
            dramatically different dynamics, often with more pronounced symmetry and
            smoother curves.
          </Paragraph>
          <SubTitle>Parameter Guide</SubTitle>
          <Paragraph>
            <strong>Parameters a and b:</strong> Control the frequency of oscillation, typically
            in the range <strong>1 to 3</strong>. Values around 1.4-1.6 produce balanced patterns.
          </Paragraph>
          <Paragraph>
            <strong>Parameters c and d:</strong> Act as amplitude multipliers with a wider range,
            typically <strong>-7 to +7</strong>. Parameter d especially affects the horizontal
            spread, and extreme values (like -6.5) can create dramatic ribbon effects.
          </Paragraph>
          <SubTitle>Example Parameter Sets</SubTitle>
          <MathBlock>
            <BlockMath math="a=1.4,\ b=1.56,\ c=1.4,\ d=-6.56 \quad \text{(Ribbon)}" />
            <BlockMath math="a=1.4,\ b=-2.3,\ c=2.4,\ d=-2.1 \quad \text{(Classic)}" />
          </MathBlock>
          <SubTitle>Exploration Tips</SubTitle>
          <Paragraph>
            Start with a and b near 1.5, then experiment with larger values of c and d (especially
            negative d values) to create the characteristic flowing ribbon patterns. The Svensson
            tends to produce more open, flowing shapes compared to the tighter spirals of Clifford.
          </Paragraph>
          <ParamList>
            <ParamBadge>a: 1 to 3</ParamBadge>
            <ParamBadge>b: -3 to 3</ParamBadge>
            <ParamBadge>c: -7 to 7</ParamBadge>
            <ParamBadge>d: -7 to 7</ParamBadge>
          </ParamList>
        </AttractorContent>
      </AttractorCard>
    </>
  );
}
