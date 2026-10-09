import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorName, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Multibrot — moved verbatim from the Help & About page.
export default function MultibrotSet() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Multibrot</AttractorName>
        <Paragraph>
          The Multibrot sets generalize the Mandelbrot set by using arbitrary powers
          instead of squaring. The standard Mandelbrot set is the Multibrot with
          <InlineMath math="d = 2" />.
        </Paragraph>
        <SubTitle>The Equation</SubTitle>
        <MathBlock>
          <BlockMath math="z_{n+1} = z_n^d + c" />
          <BlockMath math="\text{where } d \text{ is the power/degree}" />
        </MathBlock>
        <SubTitle>Effect of the Power</SubTitle>
        <Paragraph>
          Higher powers create more symmetry: Multibrot-3 has 2-fold symmetry,
          Multibrot-4 has 3-fold, and in general Multibrot-<InlineMath math="d" /> has
          <InlineMath math="(d-1)" />-fold rotational symmetry. The number of "bulbs"
          around the main body increases with the power, creating increasingly
          elaborate patterns.
        </Paragraph>
        <ParamList>
          <ParamBadge>power (d)</ParamBadge>
          <ParamBadge>centerX</ParamBadge>
          <ParamBadge>centerY</ParamBadge>
          <ParamBadge>zoom</ParamBadge>
          <ParamBadge>maxIter</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
