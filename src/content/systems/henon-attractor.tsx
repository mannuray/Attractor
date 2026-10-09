import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorName, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Hénon Attractor — moved verbatim from the Help & About page.
export default function HenonAttractor() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Hénon Attractor</AttractorName>
        <Paragraph>
          In January 1976, astronomer Michel Hénon at the Côte d'Azur Observatory attended
          a seminar on the Lorenz system's strange attractors. Intrigued, he began searching
          for the simplest possible map that could exhibit chaotic behavior. The result—published
          in his seminal paper "A two-dimensional mapping with a strange attractor"—became
          one of the most studied examples in chaos theory.
        </Paragraph>
        <SubTitle>The Equations</SubTitle>
        <MathBlock>
          <BlockMath math="x_{n+1} = 1 - a \cdot x_n^2 + y_n" />
          <BlockMath math="y_{n+1} = b \cdot x_n" />
        </MathBlock>
        <SubTitle>Geometry of the Map</SubTitle>
        <Paragraph>
          The Hénon map combines three operations: a quadratic bending (the <InlineMath math="ax^2" /> term),
          a contraction (parameter <InlineMath math="b" /> controls the Jacobian determinant), and
          a reflection. This creates the characteristic "stretched and folded" appearance of
          strange attractors. The attractor is smooth in one direction but has Cantor-set
          structure in the perpendicular direction—a fractal with dimension approximately 1.26.
        </Paragraph>
        <SubTitle>Parameter Guide</SubTitle>
        <Paragraph>
          <strong>Parameter a:</strong> Range <strong>1.0 to 1.5</strong> for bounded behavior.
          The classic value is <strong>a = 1.4</strong>. Values below 1.0 produce periodic orbits;
          above ~1.426 the orbits escape to infinity. The period-doubling route to chaos occurs
          as a increases from 1.0 toward 1.4.
        </Paragraph>
        <Paragraph>
          <strong>Parameter b:</strong> Range <strong>0.2 to 0.4</strong>, with <strong>b = 0.3</strong>
          being classic. This must satisfy <InlineMath math="|b| < 1" /> for the map to be
          dissipative (contracting area). Smaller values make the attractor thinner; larger values
          thicken it.
        </Paragraph>
        <SubTitle>Example Parameter Sets</SubTitle>
        <MathBlock>
          <BlockMath math="a=1.4,\ b=0.3 \quad \text{(Classic Hénon)}" />
          <BlockMath math="a=1.2,\ b=0.3 \quad \text{(Periodic regime)}" />
          <BlockMath math="a=1.39,\ b=0.25 \quad \text{(Thin attractor)}" />
        </MathBlock>
        <SubTitle>Bifurcation Exploration</SubTitle>
        <Paragraph>
          To see the famous period-doubling cascade: fix b = 0.3 and slowly increase a from
          1.0 to 1.4. You'll observe: period-1 → period-2 → period-4 → period-8 → ... → chaos.
          This is the same route to chaos discovered by Feigenbaum in the logistic map.
        </Paragraph>
        <ParamList>
          <ParamBadge>a: 1.0 to 1.45</ParamBadge>
          <ParamBadge>b: 0.2 to 0.4</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
