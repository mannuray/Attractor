import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorContent, AttractorHeader, AttractorName, GalleryImage, MathBlock, Paragraph, ParamBadge, ParamList } from "../docPrimitives";

// Symmetric Fractals — moved verbatim from the Help & About page.
export default function SymmetricFractals() {
  return (
    <>
      <AttractorCard>
        <AttractorHeader>
          <AttractorName>Symmetric Fractals</AttractorName>
          <GalleryImage src="/gallery/symmetric-fractal.png" alt="Symmetric Fractal" />
        </AttractorHeader>
        <AttractorContent>
          <Paragraph>
            Based on an affine transform combined with random rotations in the symmetry
            group <InlineMath math="Z_p" /> or <InlineMath math="D_p" />, depending
            on the reflect parameter.
          </Paragraph>
          <MathBlock>
            <BlockMath math="\begin{pmatrix} x' \\ y' \end{pmatrix} = \begin{pmatrix} a & b \\ c & d \end{pmatrix} \begin{pmatrix} x \\ y \end{pmatrix} + \begin{pmatrix} \alpha \\ \beta \end{pmatrix}" />
          </MathBlock>
          <Paragraph>
            The most familiar forms are Sierpinski gaskets of various symmetries,
            formed with a transform moving the current point halfway to a fixed point.
          </Paragraph>
          <ParamList>
            <ParamBadge>a, b, c, d</ParamBadge>
            <ParamBadge>alpha</ParamBadge>
            <ParamBadge>beta</ParamBadge>
            <ParamBadge>p (symmetry)</ParamBadge>
            <ParamBadge>reflect</ParamBadge>
          </ParamList>
        </AttractorContent>
      </AttractorCard>
    </>
  );
}
