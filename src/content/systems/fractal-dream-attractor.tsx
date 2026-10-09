import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorContent, AttractorHeader, AttractorName, GalleryImage, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Fractal Dream Attractors — moved verbatim from the Help & About page.
export default function FractalDreamAttractor() {
  return (
    <>
      <AttractorCard>
        <AttractorHeader>
          <AttractorName>Fractal Dream Attractors</AttractorName>
          <GalleryImage src="/gallery/fractal-dream.png" alt="Fractal Dream Attractor" />
        </AttractorHeader>
        <AttractorContent>
          <Paragraph>
            Another creation from Clifford A. Pickover's imaginative "Chaos in Wonderland" (1994).
            The Fractal Dream attractor produces ethereal, dreamlike patterns with smooth,
            flowing curves that seem to float in space.
          </Paragraph>
          <SubTitle>The Equations</SubTitle>
          <MathBlock>
            <BlockMath math="x_{n+1} = \sin(y_n \cdot b) + c \cdot \sin(x_n \cdot b)" />
            <BlockMath math="y_{n+1} = \sin(x_n \cdot a) + d \cdot \sin(y_n \cdot a)" />
          </MathBlock>
          <Paragraph>
            The structure is symmetric: both equations use sine functions with similar
            patterns. Parameters <InlineMath math="a" /> and <InlineMath math="b" /> control
            the frequency of oscillation, while <InlineMath math="c" /> and <InlineMath math="d" />
            control the amplitude of the second term. This symmetry in the equations often
            produces visually symmetric attractors.
          </Paragraph>
          <ParamList>
            <ParamBadge>a (alpha)</ParamBadge>
            <ParamBadge>b (beta)</ParamBadge>
            <ParamBadge>c (gamma)</ParamBadge>
            <ParamBadge>d (delta)</ParamBadge>
          </ParamList>
        </AttractorContent>
      </AttractorCard>
    </>
  );
}
