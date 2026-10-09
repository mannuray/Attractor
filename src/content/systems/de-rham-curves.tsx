import React from "react";
import { BlockMath } from "react-katex";
import { AttractorCard, AttractorName, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// De Rham Curves — moved verbatim from the Help & About page.
export default function DeRhamCurves() {
  return (
    <>
      <AttractorCard>
        <AttractorName>De Rham Curves</AttractorName>
        <Paragraph>
          Named after Georges de Rham, these are IFS transformations given by two
          contracting maps. Includes Cesaro curves (orientation conserving) and
          Koch-Peano curves (orientation reversing).
        </Paragraph>
        <SubTitle>Cesaro Curves (Levy C-curve):</SubTitle>
        <MathBlock>
          <BlockMath math="d_0(z) = az, \quad d_1(z) = a + (1-a)z" />
          <BlockMath math="a = \alpha + \beta i, \quad |a| < 1, \quad |1-a| < 1" />
        </MathBlock>
        <SubTitle>Koch-Peano Curves:</SubTitle>
        <MathBlock>
          <BlockMath math="d_0(z) = a\bar{z}, \quad d_1(z) = a + (1-a)\bar{z}" />
        </MathBlock>
        <ParamList>
          <ParamBadge>alpha</ParamBadge>
          <ParamBadge>beta</ParamBadge>
          <ParamBadge>type</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
