import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorContent, AttractorHeader, AttractorName, GalleryImage, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Tinkerbell Map — moved verbatim from the Help & About page.
export default function TinkerbellMap() {
  return (
    <>
      <AttractorCard>
        <AttractorHeader>
          <AttractorName>Tinkerbell Map</AttractorName>
          <GalleryImage src="/gallery/tinkerbell.png" alt="Tinkerbell Attractor" />
        </AttractorHeader>
        <AttractorContent>
          <Paragraph>
            Named after the fairy from Peter Pan—the trajectory of points traces patterns
            reminiscent of Tinker Bell's flight. This discrete-time dynamical system exhibits
            remarkably rich dynamics including chaos, period-doubling cascades, and Hopf
            bifurcations.
          </Paragraph>
          <SubTitle>The Equations</SubTitle>
          <MathBlock>
            <BlockMath math="x_{n+1} = x_n^2 - y_n^2 + a \cdot x_n + b \cdot y_n" />
            <BlockMath math="y_{n+1} = 2x_n y_n + c \cdot x_n + d \cdot y_n" />
          </MathBlock>
          <SubTitle>Connection to Complex Dynamics</SubTitle>
          <Paragraph>
            The structure closely resembles the iteration of a complex quadratic map. If we
            write <InlineMath math="z = x + iy" />, the first two terms (<InlineMath math="x^2 - y^2" />
            and <InlineMath math="2xy" />) are exactly the real and imaginary parts
            of <InlineMath math="z^2" />. The additional linear terms perturb this pure quadratic
            behavior, creating the distinctive wing-like attractor.
          </Paragraph>
          <SubTitle>Parameter Guide</SubTitle>
          <Paragraph>
            The Tinkerbell remains chaotic only within specific parameter ranges:
          </Paragraph>
          <Paragraph>
            <strong>Parameter a:</strong> Range <strong>0.84 to 0.95</strong> for chaotic behavior.
            The classic value is 0.9. Values outside this range often cause escape to infinity
            or collapse to a fixed point.
          </Paragraph>
          <Paragraph>
            <strong>Parameter b:</strong> Range <strong>-0.65 to -0.55</strong>. Typically around -0.6.
            Must be negative for the characteristic wing shape.
          </Paragraph>
          <Paragraph>
            <strong>Parameter c:</strong> Range <strong>1.9 to 2.1</strong>. Usually set to 2.0.
            Controls the coupling strength.
          </Paragraph>
          <Paragraph>
            <strong>Parameter d:</strong> Range <strong>0.4 to 0.55</strong>. Typically 0.5.
          </Paragraph>
          <Paragraph>
            <strong>Starting point:</strong> Use <InlineMath math="(-0.72, -0.64)" /> for the
            classic attractor. Other starting points may work but can produce different or
            no visible patterns.
          </Paragraph>
          <SubTitle>Example Parameter Sets</SubTitle>
          <MathBlock>
            <BlockMath math="a=0.9,\ b=-0.6,\ c=2.0,\ d=0.5 \quad \text{(Classic)}" />
            <BlockMath math="a=0.89,\ b=-0.61,\ c=1.95,\ d=0.48 \quad \text{(Variant)}" />
          </MathBlock>
          <SubTitle>Caution</SubTitle>
          <Paragraph>
            The Tinkerbell map has very narrow parameter windows for chaos. Unlike Clifford or
            De Jong, random exploration rarely succeeds. Stick close to the classic values and
            make only tiny adjustments (±0.05).
          </Paragraph>
          <ParamList>
            <ParamBadge>a: 0.84 to 0.95</ParamBadge>
            <ParamBadge>b: -0.65 to -0.55</ParamBadge>
            <ParamBadge>c: 1.9 to 2.1</ParamBadge>
            <ParamBadge>d: 0.4 to 0.55</ParamBadge>
          </ParamList>
        </AttractorContent>
      </AttractorCard>
    </>
  );
}
