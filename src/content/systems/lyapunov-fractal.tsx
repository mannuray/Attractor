import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorContent, AttractorHeader, AttractorName, GalleryImage, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Lyapunov Fractal — moved verbatim from the Help & About page.
export default function LyapunovFractal() {
  return (
    <>
      <AttractorCard>
        <AttractorHeader>
          <AttractorName>Lyapunov Fractal</AttractorName>
          <GalleryImage src="/gallery/lyapunov.png" alt="Lyapunov Fractal" />
        </AttractorHeader>
        <AttractorContent>
          <Paragraph>
            Discovered in the late 1980s by Mario Markus at the Max Planck Institute
            and popularized by a 1991 Scientific American article, Lyapunov fractals
            visualize the transition between order and chaos in the logistic map.
          </Paragraph>
          <SubTitle>The Logistic Map</SubTitle>
          <Paragraph>
            The logistic map <InlineMath math="x_{n+1} = rx_n(1-x_n)" /> is a simple
            population model that exhibits the full range of dynamical behavior from
            stable to chaotic, depending on <InlineMath math="r" />:
          </Paragraph>
          <MathBlock>
            <BlockMath math="x_{n+1} = r_n \cdot x_n(1 - x_n)" />
            <BlockMath math="\text{where } r_n \text{ cycles through sequence values}" />
          </MathBlock>
          <SubTitle>The Lyapunov Exponent</SubTitle>
          <Paragraph>
            The Lyapunov exponent <InlineMath math="\lambda" /> measures how fast nearby
            trajectories diverge—the defining characteristic of chaos:
          </Paragraph>
          <MathBlock>
            <BlockMath math="\lambda = \lim_{n \to \infty} \frac{1}{n} \sum_{i=1}^{n} \log|r_i(1 - 2x_i)|" />
          </MathBlock>
          <Paragraph>
            When <InlineMath math="\lambda > 0" />, the system is chaotic (trajectories
            diverge exponentially). When <InlineMath math="\lambda < 0" />, it's stable
            (trajectories converge). The fractal is colored by this value, creating
            distinctive striped patterns where regions of chaos and stability interweave.
          </Paragraph>
          <SubTitle>Parameter Guide</SubTitle>
          <Paragraph>
            <strong>Sequence:</strong> A string of A's and B's (e.g., "AB", "AABB", "BBBAA").
            The sequence determines how r-values alternate. Classic sequences:
          </Paragraph>
          <Paragraph>
            • <strong>"AB":</strong> The classic Lyapunov fractal with swooping stripes.
          </Paragraph>
          <Paragraph>
            • <strong>"AABB":</strong> Creates more complex interweaving patterns.
          </Paragraph>
          <Paragraph>
            • <strong>"BBBBBBAAAAAA":</strong> Extreme patterns with long runs.
          </Paragraph>
          <Paragraph>
            <strong>R-value range:</strong> Typically <strong>2 to 4</strong> for both
            axes. The interesting region is usually between 2.5 and 4.0. Below 2, the
            system is always stable; above 4, it often diverges.
          </Paragraph>
          <SubTitle>Coloring Convention</SubTitle>
          <Paragraph>
            Traditionally: <strong>negative λ (stable) → blues</strong>,
            <strong> positive λ (chaotic) → yellows/oranges</strong>,
            <strong> λ near 0 → black</strong> (the boundary between order and chaos).
          </Paragraph>
          <SubTitle>Exploration Tips</SubTitle>
          <Paragraph>
            The stripes represent sudden transitions between order and chaos. Zooming
            into the boundary regions reveals self-similar structure. Try different
            sequences—even simple changes (AB vs BA) produce dramatically different patterns.
          </Paragraph>
          <ParamList>
            <ParamBadge>sequence: AB, AABB, etc.</ParamBadge>
            <ParamBadge>rA: 2 to 4</ParamBadge>
            <ParamBadge>rB: 2 to 4</ParamBadge>
          </ParamList>
        </AttractorContent>
      </AttractorCard>
    </>
  );
}
