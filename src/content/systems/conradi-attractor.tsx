import React from "react";
import { BlockMath } from "react-katex";
import { AttractorCard, AttractorContent, AttractorHeader, AttractorName, GalleryImage, MathBlock, Paragraph, ParamBadge, ParamList } from "../docPrimitives";

// Conradi Attractors — moved verbatim from the Help & About page.
export default function ConradiAttractor() {
  return (
    <>
      <AttractorCard>
        <AttractorHeader>
          <AttractorName>Conradi Attractors</AttractorName>
          <GalleryImage src="/gallery/conradi.png" alt="Conradi Attractor" />
        </AttractorHeader>
        <AttractorContent>
          <Paragraph>
            Found in Simone Conradi's work, these use complex-number rotational
            transformations combined with inversions.
          </Paragraph>
          <MathBlock>
            <BlockMath math="f(z) = \left(r_1 e^{i\theta_1} \frac{1}{z} + r_2 e^{i\theta_2} \bar{z} + a\right) e^{2\pi i k/n}" />
          </MathBlock>
          <ParamList>
            <ParamBadge>r1, r2</ParamBadge>
            <ParamBadge>theta1, theta2</ParamBadge>
            <ParamBadge>a</ParamBadge>
            <ParamBadge>n (symmetry)</ParamBadge>
          </ParamList>
        </AttractorContent>
      </AttractorCard>
    </>
  );
}
