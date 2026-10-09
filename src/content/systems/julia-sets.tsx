import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import { AttractorCard, AttractorName, GridImage, ImageGrid, ImageLabel, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Julia Sets — moved verbatim from the Help & About page.
export default function JuliaSets() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Julia Sets</AttractorName>
        <Paragraph>
          Named after French mathematician Gaston Julia (1893-1978), who published his
          masterpiece on iterated rational functions in 1918, winning the Grand Prix
          of the Académie des Sciences. Remarkably, Julia discovered the properties of
          these sets without ever seeing them—computers didn't exist yet.
        </Paragraph>
        <ImageGrid>
          <div><GridImage src="/gallery/julia-dragon.png" alt="Dragon" /><ImageLabel>Dragon</ImageLabel></div>
          <div><GridImage src="/gallery/julia-rabbit.png" alt="Rabbit" /><ImageLabel>Rabbit</ImageLabel></div>
          <div><GridImage src="/gallery/julia-starfish.png" alt="Starfish" /><ImageLabel>Starfish</ImageLabel></div>
          <div><GridImage src="/gallery/julia-spiral.png" alt="Spiral" /><ImageLabel>Spiral</ImageLabel></div>
          <div><GridImage src="/gallery/julia-dendrite.png" alt="Dendrite" /><ImageLabel>Dendrite</ImageLabel></div>
        </ImageGrid>
        <SubTitle>The Key Difference</SubTitle>
        <Paragraph>
          Julia sets use the same equation as Mandelbrot, but the roles are reversed:
        </Paragraph>
        <MathBlock>
          <BlockMath math="z_{n+1} = z_n^2 + c" />
          <BlockMath math="\text{Starting with } z_0 = \text{pixel coordinate}" />
        </MathBlock>
        <Paragraph>
          Here <InlineMath math="c" /> is fixed, and we iterate starting from each
          pixel's coordinates. This means each value of <InlineMath math="c" /> produces
          a completely different Julia set—there are infinitely many Julia sets, one
          for each complex number.
        </Paragraph>
        <SubTitle>Connected vs. Disconnected</SubTitle>
        <Paragraph>
          Julia sets have a remarkable property: they are either <strong>connected</strong> (one
          piece) or <strong>totally disconnected</strong> ("Cantor dust"). The Mandelbrot
          set serves as an index: if <InlineMath math="c" /> is inside the Mandelbrot set,
          its Julia set is connected; if outside, it's disconnected. Points on the Mandelbrot
          boundary produce the most intricate Julia sets.
        </Paragraph>
        <SubTitle>Choosing c Values</SubTitle>
        <Paragraph>
          <strong>The Mandelbrot Connection:</strong> The Mandelbrot set is a map of all
          Julia sets. Pick any point in the Mandelbrot image—that c value produces a Julia
          set with similar visual character. Boundary points create the most elaborate Julias.
        </Paragraph>
        <SubTitle>Famous c Values</SubTitle>
        <Paragraph>
          • <strong>Douady Rabbit:</strong> <InlineMath math="c = -0.123 + 0.745i" /> —
          A connected Julia set with three "ears" resembling a rabbit.
        </Paragraph>
        <Paragraph>
          • <strong>San Marco (Dragon):</strong> <InlineMath math="c = -0.75 + 0i" /> —
          Resembles the dragon columns of San Marco cathedral in Venice.
        </Paragraph>
        <Paragraph>
          • <strong>Dendrite:</strong> <InlineMath math="c = 0 + i" /> — A tree-like
          lightning bolt pattern. Located at the "antenna tip" of the Mandelbrot set.
        </Paragraph>
        <Paragraph>
          • <strong>Siegel Disk:</strong> <InlineMath math="c = -0.391 - 0.587i" /> —
          Contains a smooth region (the Siegel disk) surrounded by fractal boundary.
        </Paragraph>
        <Paragraph>
          • <strong>Spiral:</strong> <InlineMath math="c = -0.8 + 0.156i" /> —
          Beautiful spiraling arms emanating from the center.
        </Paragraph>
        <Paragraph>
          • <strong>Starfish:</strong> <InlineMath math="c = -0.4 + 0.6i" /> —
          Five-armed starfish-like pattern.
        </Paragraph>
        <Paragraph>
          • <strong>Galaxy:</strong> <InlineMath math="c = 0.285 + 0.01i" /> —
          Swirling spiral arms like a galaxy.
        </Paragraph>
        <SubTitle>Exploration Strategy</SubTitle>
        <Paragraph>
          Open the Mandelbrot view, find an interesting boundary region, note the coordinates,
          then use those as c for a Julia set. Points inside Mandelbrot → connected Julia;
          points outside → disconnected "dust"; points on the boundary → the most complex patterns.
        </Paragraph>
        <ParamList>
          <ParamBadge>c_real: -2 to 2</ParamBadge>
          <ParamBadge>c_imag: -2 to 2</ParamBadge>
          <ParamBadge>zoom: 0.5 to 10¹⁴</ParamBadge>
          <ParamBadge>maxIter: 100 to 10000+</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
