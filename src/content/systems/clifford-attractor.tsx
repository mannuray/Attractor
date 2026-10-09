import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorName, GridImage, ImageGrid, ImageLabel, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Clifford Attractors — moved verbatim from the Help & About page.
export default function CliffordAttractor() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Clifford Attractors</AttractorName>
        <Paragraph>
          Created by Clifford A. Pickover and introduced in his book "Chaos in Wonderland" (1994),
          the Clifford attractor is one of the most popular strange attractors due to its elegant
          simplicity and the stunning variety of patterns it produces. Pickover, a prolific author
          and researcher at IBM, has contributed extensively to fractal art and recreational mathematics.
        </Paragraph>
        <ImageGrid>
          <div><GridImage src="/gallery/clifford.png" alt="Classic" /><ImageLabel>Classic</ImageLabel></div>
          <div><GridImage src="/gallery/clifford-swirl.png" alt="Swirl" /><ImageLabel>Swirl</ImageLabel></div>
        </ImageGrid>
        <SubTitle>The Equations</SubTitle>
        <Paragraph>
          The Clifford attractor uses trigonometric functions to create its characteristic
          swirling patterns. Starting from any point <InlineMath math="(x_0, y_0)" />, we
          repeatedly apply these transformations:
        </Paragraph>
        <MathBlock>
          <BlockMath math="x_{n+1} = \sin(a \cdot y_n) + c \cdot \cos(a \cdot x_n)" />
          <BlockMath math="y_{n+1} = \sin(b \cdot x_n) + d \cdot \cos(b \cdot y_n)" />
        </MathBlock>
        <SubTitle>Why It Works</SubTitle>
        <Paragraph>
          The sine and cosine functions bound the output to a finite region (roughly
          <InlineMath math="[-2, 2] \times [-2, 2]" />), preventing trajectories from
          escaping to infinity. The four parameters <InlineMath math="a, b, c, d" /> control
          the frequency and amplitude of the oscillations, producing dramatically different
          patterns. Even tiny parameter changes can transform the attractor completely—a
          hallmark of chaotic systems.
        </Paragraph>
        <SubTitle>Parameter Guide</SubTitle>
        <Paragraph>
          <strong>All parameters (a, b, c, d):</strong> Typically range from <strong>-3 to +3</strong>,
          though values between <strong>-2 and +2</strong> are most commonly used. The attractor
          is remarkably forgiving—unlike some systems, small parameter changes usually produce
          gradual visual changes rather than complete destruction of the pattern.
        </Paragraph>
        <Paragraph>
          <strong>Parameters a and b:</strong> Control the <em>frequency</em> of the oscillations.
          Higher absolute values create more tightly wound spirals and finer detail. Values near
          ±1.5 to ±2.0 often produce the most intricate patterns.
        </Paragraph>
        <Paragraph>
          <strong>Parameters c and d:</strong> Control the <em>amplitude</em> of the cosine terms,
          affecting the overall spread and density of the attractor. Values near ±1 create
          balanced patterns; larger values stretch the attractor.
        </Paragraph>
        <SubTitle>Example Parameter Sets</SubTitle>
        <Paragraph>
          These combinations produce visually striking attractors:
        </Paragraph>
        <MathBlock>
          <BlockMath math="a=-1.4,\ b=1.7,\ c=1.0,\ d=0.7 \quad \text{(Classic swirl)}" />
          <BlockMath math="a=1.7,\ b=1.7,\ c=0.6,\ d=1.2 \quad \text{(Dense pattern)}" />
          <BlockMath math="a=-1.3,\ b=-1.3,\ c=-1.8,\ d=-1.9 \quad \text{(Trajectory)}" />
          <BlockMath math="a=-1.7,\ b=1.3,\ c=-0.1,\ d=-1.21 \quad \text{(Pickover's original)}" />
        </MathBlock>
        <SubTitle>Tips for Exploration</SubTitle>
        <Paragraph>
          Clifford attractors are among the easiest to explore—random parameters in the ±2 range
          frequently produce interesting results. However, some combinations yield only scattered
          points or simple loops. If the pattern looks boring, try increasing the absolute values
          of a and b, or adjusting c and d in opposite directions. Starting point doesn't matter
          much; the attractor will converge to the same shape regardless.
        </Paragraph>
        <ParamList>
          <ParamBadge>a: -3 to 3</ParamBadge>
          <ParamBadge>b: -3 to 3</ParamBadge>
          <ParamBadge>c: -3 to 3</ParamBadge>
          <ParamBadge>d: -3 to 3</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
