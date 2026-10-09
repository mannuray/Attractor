import React from "react";
import { BlockMath } from "react-katex";
import { AttractorCard, AttractorName, MathBlock, Paragraph, ParamBadge, ParamList } from "../docPrimitives";

// Mobius Attractors — moved verbatim from the Help & About page.
export default function MobiusAttractor() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Mobius Attractors</AttractorName>
        <Paragraph>
          Another attractor from Simone Conradi, using Mobius transformations
          before the random rotation.
        </Paragraph>
        <MathBlock>
          <BlockMath math="f(z) = \frac{az + b}{cz + d} \cdot e^{2\pi i m/n}" />
          <BlockMath math="m = 0, 1, 2, \ldots, n-1" />
        </MathBlock>
        <ParamList>
          <ParamBadge>a, b, c, d</ParamBadge>
          <ParamBadge>n (symmetry)</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
