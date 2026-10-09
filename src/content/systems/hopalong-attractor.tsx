import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorName, GridImage, ImageGrid, ImageLabel, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Hopalong Attractors — moved verbatim from the Help & About page.
export default function HopalongAttractor() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Hopalong Attractors</AttractorName>
        <Paragraph>
          Created by Barry Martin of Aston University, Birmingham, the Hopalong attractor
          (also called the Martin attractor) was popularized through A.K. Dewdney's
          "Computer Recreations" column in Scientific American (1986). Its name comes from
          the way points seem to "hop" across the plane in discrete jumps.
        </Paragraph>
        <ImageGrid>
          <div><GridImage src="/gallery/hopalong.png" alt="Phoenix" /><ImageLabel>Phoenix</ImageLabel></div>
          <div><GridImage src="/gallery/hopalong-spiral.png" alt="Spiral" /><ImageLabel>Spiral</ImageLabel></div>
        </ImageGrid>
        <SubTitle>The Equations</SubTitle>
        <MathBlock>
          <BlockMath math="x_{n+1} = y_n - \text{sgn}(x_n)\sqrt{|b \cdot x_n - c|}" />
          <BlockMath math="y_{n+1} = a - x_n" />
        </MathBlock>
        <SubTitle>Understanding the Math</SubTitle>
        <Paragraph>
          The <InlineMath math="\text{sgn}(x)" /> function returns -1, 0, or 1 depending on
          whether <InlineMath math="x" /> is negative, zero, or positive. Combined with the
          square root of an absolute value, this creates the characteristic "hopping"
          behavior. The second equation is remarkably simple—just subtracting from a
          constant—yet the interaction produces complex, often symmetric patterns.
        </Paragraph>
        <SubTitle>Parameter Guide</SubTitle>
        <Paragraph>
          <strong>Parameter a:</strong> The "offset" constant, can range widely from <strong>-100 to +100</strong>
          or more. Classic values are small (0.4 to 2.0), but larger values create larger patterns.
          This parameter has the most dramatic effect on overall shape.
        </Paragraph>
        <Paragraph>
          <strong>Parameter b:</strong> Multiplier for the square root term. Typically <strong>-10 to +10</strong>,
          with values near 1 being common. Affects the "spread" and density of the pattern.
        </Paragraph>
        <Paragraph>
          <strong>Parameter c:</strong> Offset inside the square root. Range <strong>-50 to +50</strong>.
          Often set to small values or 0. Affects the symmetry and complexity of the pattern.
        </Paragraph>
        <SubTitle>Example Parameter Sets</SubTitle>
        <MathBlock>
          <BlockMath math="a=-55,\ b=-1,\ c=42 \quad \text{(Classic)}" />
          <BlockMath math="a=2.0,\ b=0.05,\ c=2.0 \quad \text{(Compact spiral)}" />
          <BlockMath math="a=0.4,\ b=1.0,\ c=0.0 \quad \text{(Simple)}" />
          <BlockMath math="a=7.17,\ b=8.44,\ c=2.56 \quad \text{(Complex)}" />
        </MathBlock>
        <SubTitle>Important Note: Not a True Attractor</SubTitle>
        <Paragraph>
          Unlike Clifford or De Jong, the Hopalong is not a true attractor—the pattern depends
          on the starting point (x₀, y₀), not just the parameters. Different initial points
          can produce completely different patterns with the same a, b, c values. This makes
          exploration even more varied: if you find interesting parameters, try different
          starting points to discover new shapes.
        </Paragraph>
        <SubTitle>The Butterfly Effect</SubTitle>
        <Paragraph>
          Hopalong exhibits extreme sensitivity: tiny parameter changes create completely
          different images. This is trial-and-error exploration—when you find something
          promising, make very small adjustments (±0.01) to refine it.
        </Paragraph>
        <ParamList>
          <ParamBadge>a: -100 to 100</ParamBadge>
          <ParamBadge>b: -10 to 10</ParamBadge>
          <ParamBadge>c: -50 to 50</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
