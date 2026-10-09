import React from "react";
import { BlockMath } from "react-katex";
import { AttractorCard, AttractorName, MathBlock, Paragraph, ParamBadge, ParamList } from "../docPrimitives";

// Sprott Attractors — moved verbatim from the Help & About page.
export default function SprottAttractor() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Sprott Attractors</AttractorName>
        <Paragraph>
          J.C. Sprott's complex 12-parameter discrete-time dynamical system, from a
          method of automatically finding potentially interesting attractors based
          on their Lyapunov exponent.
        </Paragraph>
        <MathBlock>
          <BlockMath math="x_{n+1} = a_1 + a_2 x_n + a_3 x_n^2 + a_4 x_n y_n + a_5 y_n + a_6 y_n^2" />
          <BlockMath math="y_{n+1} = a_7 + a_8 x_n + a_9 x_n^2 + a_{10} x_n y_n + a_{11} y_n + a_{12} y_n^2" />
        </MathBlock>
        <ParamList>
          <ParamBadge>a1-a12</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
