import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorContent, AttractorHeader, AttractorName, GalleryImage, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Phoenix Fractal — moved verbatim from the Help & About page.
export default function PhoenixFractal() {
  return (
    <>
      <AttractorCard>
        <AttractorHeader>
          <AttractorName>Phoenix Fractal</AttractorName>
          <GalleryImage src="/gallery/phoenix.png" alt="Phoenix Fractal" />
        </AttractorHeader>
        <AttractorContent>
          <Paragraph>
            The Phoenix fractal extends the Julia set formula by incorporating a "memory"
            term—the previous iteration value. This creates more complex dynamics and
            produces distinctive phoenix-like patterns with wing and feather structures.
          </Paragraph>
          <SubTitle>The Equation</SubTitle>
          <MathBlock>
            <BlockMath math="z_{n+1} = z_n^2 + c + p \cdot z_{n-1}" />
            <BlockMath math="\text{where } p \text{ is the phoenix parameter}" />
          </MathBlock>
          <SubTitle>The Memory Effect</SubTitle>
          <Paragraph>
            Unlike the Mandelbrot and Julia sets where each iteration depends only on
            the current value, the Phoenix fractal looks back one step. This "memory"
            creates feedback loops that produce the characteristic layered, feathered
            appearance. The parameter <InlineMath math="p" /> controls how much
            influence the previous iteration has.
          </Paragraph>
          <ParamList>
            <ParamBadge>c</ParamBadge>
            <ParamBadge>p (phoenix)</ParamBadge>
            <ParamBadge>zoom</ParamBadge>
            <ParamBadge>maxIter</ParamBadge>
          </ParamList>
        </AttractorContent>
      </AttractorCard>
    </>
  );
}
