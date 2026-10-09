import React from "react";
import { BlockMath } from "react-katex";
import { AttractorCard, AttractorName, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Jason Rampe Attractors (1, 2, 3) — moved verbatim from the Help & About page.
export default function JasonRampeAttractors() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Jason Rampe Attractors (1, 2, 3)</AttractorName>
        <Paragraph>
          Three related attractors by Jason Rampe, each with variations on sine and
          cosine combinations creating unique patterns.
        </Paragraph>
        <SubTitle>Jason Rampe 1:</SubTitle>
        <MathBlock>
          <BlockMath math="x_{n+1} = \cos(y_n \cdot b) + c \cdot \sin(x_n \cdot b)" />
          <BlockMath math="y_{n+1} = \cos(x_n \cdot a) + d \cdot \sin(y_n \cdot a)" />
        </MathBlock>
        <SubTitle>Jason Rampe 2:</SubTitle>
        <MathBlock>
          <BlockMath math="x_{n+1} = \cos(y_n \cdot b) + c \cdot \cos(x_n \cdot b)" />
          <BlockMath math="y_{n+1} = \cos(x_n \cdot a) + d \cdot \cos(y_n \cdot a)" />
        </MathBlock>
        <SubTitle>Jason Rampe 3:</SubTitle>
        <MathBlock>
          <BlockMath math="x_{n+1} = \sin(y_n \cdot b) + c \cdot \cos(x_n \cdot b)" />
          <BlockMath math="y_{n+1} = \cos(x_n \cdot a) + d \cdot \sin(y_n \cdot a)" />
        </MathBlock>
        <ParamList>
          <ParamBadge>a (alpha)</ParamBadge>
          <ParamBadge>b (beta)</ParamBadge>
          <ParamBadge>c (gamma)</ParamBadge>
          <ParamBadge>d (delta)</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
