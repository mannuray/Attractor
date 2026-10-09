import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorContent, AttractorHeader, AttractorName, GalleryImage, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Bedhead Attractors — moved verbatim from the Help & About page.
export default function BedheadAttractor() {
  return (
    <>
      <AttractorCard>
        <AttractorHeader>
          <AttractorName>Bedhead Attractors</AttractorName>
          <GalleryImage src="/gallery/bedhead.png" alt="Bedhead Attractor" />
        </AttractorHeader>
        <AttractorContent>
          <Paragraph>
            The Bedhead attractor creates organic, hair-like flowing patterns that resemble
            tangled strands—hence its whimsical name. Unlike other attractors in this family,
            it uses only two parameters but achieves complexity through the interaction
            between <InlineMath math="x" /> and <InlineMath math="y" /> in its equations.
          </Paragraph>
          <SubTitle>The Equations</SubTitle>
          <MathBlock>
            <BlockMath math="x_{n+1} = \sin\left(\frac{x_n \cdot y_n}{b}\right) + \cos(a \cdot x_n - y_n)" />
            <BlockMath math="y_{n+1} = x_n + \frac{\sin(y_n)}{b}" />
          </MathBlock>
          <Paragraph>
            The term <InlineMath math="x_n \cdot y_n / b" /> creates coupling between the
            two variables, while the <InlineMath math="\sin(y_n)/b" /> term in the second
            equation creates the flowing, strand-like appearance. Small values
            of <InlineMath math="b" /> amplify these effects, creating denser tangles.
          </Paragraph>
          <SubTitle>Parameter Guide</SubTitle>
          <Paragraph>
            <strong>Parameter a:</strong> Controls the angular frequency. Range <strong>-1 to 1</strong>,
            with values near 0 (like 0.06) producing the finest detail. Values outside this range
            can cause the attractor to become unstable or overly chaotic.
          </Paragraph>
          <Paragraph>
            <strong>Parameter b:</strong> Acts as a scaling divisor—<strong>critical for stability</strong>.
            Must be non-zero; values near <strong>0.8 to 1.0</strong> work well. Smaller values
            (approaching 0) create denser, more tangled patterns but can cause numerical instability.
            Values significantly larger than 1 flatten the attractor.
          </Paragraph>
          <SubTitle>Example Parameter Sets</SubTitle>
          <MathBlock>
            <BlockMath math="a=0.06,\ b=0.98 \quad \text{(Classic bedhead)}" />
            <BlockMath math="a=-0.81,\ b=0.83 \quad \text{(Dense tangle)}" />
            <BlockMath math="a=0.65,\ b=0.7 \quad \text{(Flowing strands)}" />
          </MathBlock>
          <SubTitle>Warning</SubTitle>
          <Paragraph>
            The Bedhead attractor is sensitive to parameter choices. If b approaches 0, division
            by small numbers causes numerical issues. If the pattern looks blank or scattered,
            try increasing b toward 1.0. Start with the classic values and make small adjustments.
          </Paragraph>
          <ParamList>
            <ParamBadge>a: -1 to 1</ParamBadge>
            <ParamBadge>b: 0.5 to 1.5</ParamBadge>
          </ParamList>
        </AttractorContent>
      </AttractorCard>
    </>
  );
}
