import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorContent, AttractorHeader, AttractorName, GalleryImage, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Gumowski-Mira Attractors — moved verbatim from the Help & About page.
export default function GumowskiMiraAttractor() {
  return (
    <>
      <AttractorCard>
        <AttractorHeader>
          <AttractorName>Gumowski-Mira Attractors</AttractorName>
          <GalleryImage src="/gallery/gumowski-mira.png" alt="Gumowski-Mira Attractor" />
        </AttractorHeader>
        <AttractorContent>
          <Paragraph>
            Developed in 1980 at <strong>CERN</strong> (the European Organization for Nuclear
            Research) by physicists I. Gumowski and C. Mira. Originally created to model
            the trajectories of sub-atomic particles in accelerators, these equations
            produce stunning symmetric patterns resembling butterflies, flowers, and
            cosmic phenomena.
          </Paragraph>
          <SubTitle>The Equations</SubTitle>
          <Paragraph>
            The system uses a helper function <InlineMath math="f(x)" /> that creates
            nonlinear feedback:
          </Paragraph>
          <MathBlock>
            <BlockMath math="f(x) = \mu x + \frac{2(1-\mu)x^2}{1 + x^2}" />
          </MathBlock>
          <Paragraph>
            This function is then used in the main iteration:
          </Paragraph>
          <MathBlock>
            <BlockMath math="x_{n+1} = y_n + \alpha(1 - \sigma y_n^2)y_n + f(x_n)" />
            <BlockMath math="y_{n+1} = -x_n + f(x_{n+1})" />
          </MathBlock>
          <SubTitle>Parameter Guide</SubTitle>
          <Paragraph>
            <strong>Mu (μ):</strong> The <em>critical</em> parameter, ranging from <strong>-1 to 1</strong>.
            This controls the transition between regular and chaotic dynamics. Values near -0.5 to -0.8
            often produce the most beautiful "marine creature" patterns. Small changes (±0.01) can
            completely transform the attractor.
          </Paragraph>
          <Paragraph>
            <strong>Alpha (α):</strong> Usually <strong>0 to 0.1</strong>. Often set to 0 for the
            simplest patterns. Non-zero values add additional complexity and asymmetry. Higher values
            can cause instability.
          </Paragraph>
          <Paragraph>
            <strong>Sigma (σ):</strong> Typically <strong>0 to 1</strong>. Often set to 0 or small
            values. Controls damping in the y-direction.
          </Paragraph>
          <Paragraph>
            <strong>Starting point:</strong> Unlike other attractors, the Gumowski-Mira is sensitive
            to initial conditions. Try starting near <InlineMath math="(0.1, 0.1)" /> or experiment
            with small non-zero values.
          </Paragraph>
          <SubTitle>Example Parameter Sets</SubTitle>
          <MathBlock>
            <BlockMath math="\mu=-0.75,\ \alpha=0.0,\ \sigma=0.5 \quad \text{(Classic butterfly)}" />
            <BlockMath math="\mu=-0.496,\ \alpha=0.0,\ \sigma=0.0 \quad \text{(Symmetric)}" />
            <BlockMath math="\mu=0.93,\ \alpha=0.0,\ \sigma=0.0 \quad \text{(Spiral)}" />
          </MathBlock>
          <SubTitle>Exploration Strategy</SubTitle>
          <Paragraph>
            Focus on μ first: start at -0.5 and slowly adjust by 0.01-0.05 increments. When you find
            a promising value, lock it in and experiment with alpha. The patterns often resemble
            "living marine creatures"—starfish, jellyfish, and other organic forms.
          </Paragraph>
          <ParamList>
            <ParamBadge>mu: -1 to 1</ParamBadge>
            <ParamBadge>alpha: 0 to 0.1</ParamBadge>
            <ParamBadge>sigma: 0 to 1</ParamBadge>
          </ParamList>
        </AttractorContent>
      </AttractorCard>
    </>
  );
}
