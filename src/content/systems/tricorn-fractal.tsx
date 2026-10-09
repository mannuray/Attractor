import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorName, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Tricorn (Mandelbar) — moved verbatim from the Help & About page.
export default function TricornFractal() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Tricorn (Mandelbar)</AttractorName>
        <Paragraph>
          The Tricorn, also called the Mandelbar set, uses complex conjugation instead
          of simple squaring. This creates a fractal with three-fold symmetry and
          distinctive "horn" structures.
        </Paragraph>
        <SubTitle>The Equation</SubTitle>
        <MathBlock>
          <BlockMath math="z_{n+1} = \bar{z}_n^2 + c" />
        </MathBlock>
        <Paragraph>
          Here <InlineMath math="\bar{z}" /> denotes the complex conjugate
          (negating the imaginary part). This seemingly small change—using
          <InlineMath math="\bar{z}" /> instead of <InlineMath math="z" />—produces
          a fundamentally different fractal with its own family of embedded mini-sets
          and intricate boundary structures.
        </Paragraph>
        <ParamList>
          <ParamBadge>centerX</ParamBadge>
          <ParamBadge>centerY</ParamBadge>
          <ParamBadge>zoom</ParamBadge>
          <ParamBadge>maxIter</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
