import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// ============= STYLED COMPONENTS =============

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
  color: #ffffff;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 180, 120, 0.15);
  z-index: 100;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 180, 120, 0.3);
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
    border-color: rgba(255, 180, 120, 0.5);
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const TabNav = styled.nav`
  display: flex;
  gap: 4px;
  padding: 0 24px 12px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 180, 120, 0.3);
    border-radius: 2px;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  background: ${props => props.$active
    ? "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)"
    : "rgba(0, 0, 0, 0.3)"};
  border: 1px solid ${props => props.$active
    ? "transparent"
    : "rgba(255, 180, 120, 0.2)"};
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$active
      ? "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)"
      : "rgba(0, 0, 0, 0.5)"};
    border-color: rgba(255, 180, 120, 0.4);
  }
`;

const Content = styled.main`
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px 64px;
`;

const Section = styled.section`
  background: rgba(255, 180, 120, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 180, 120, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 700;
  color: rgba(255, 180, 120, 0.9);
`;

const SubTitle = styled.h3`
  margin: 24px 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 180, 120, 0.8);
`;

const Paragraph = styled.p`
  margin: 0 0 16px 0;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
`;

const MathBlock = styled.div`
  background: rgba(0, 0, 0, 0.4);
  padding: 16px 20px;
  border-radius: 10px;
  margin: 16px 0;
  overflow-x: auto;

  .katex {
    font-size: 1.1em;
  }
`;

const AttractorCard = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 180, 120, 0.15);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const AttractorHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 16px;
`;

const GalleryImage = styled.img`
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 180, 120, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  margin: 16px 0;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 30px rgba(255, 180, 120, 0.2);
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 24px 0;
  width: 100%;
`;

const GridImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(255, 180, 120, 0.3);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 36px rgba(255, 180, 120, 0.3);
  }
`;

const ImageLabel = styled.span`
  display: block;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10px;
`;

const AttractorContent = styled.div`
  width: 100%;
  text-align: left;
`;

const AttractorName = styled.h4`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
`;

const UsageList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const UsageItem = styled.li`
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 180, 120, 0.1);
  display: flex;
  gap: 12px;
  line-height: 1.6;

  &:last-child {
    border-bottom: none;
  }
`;

const StepNumber = styled.span`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
`;

const ParamList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const ParamBadge = styled.span`
  padding: 4px 10px;
  background: rgba(255, 180, 120, 0.15);
  border: 1px solid rgba(255, 180, 120, 0.3);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 180, 120, 0.9);
`;

const CreditSection = styled.div`
  text-align: center;
  padding: 20px;
`;

const CreditLink = styled.a`
  color: rgba(255, 180, 120, 0.9);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

// ============= TAB CONTENT COMPONENTS =============

const HowToUseTab: React.FC = () => (
  <>
    <Section>
      <SectionTitle>Getting Started</SectionTitle>
      <Paragraph>
        Chaos Iterator is a visualization tool for exploring strange attractors,
        iterated function systems (IFS), and escape-time fractals. Each type of
        visualization uses different mathematical equations to create stunning
        patterns from simple rules.
      </Paragraph>
      <UsageList>
        <UsageItem>
          <StepNumber>1</StepNumber>
          <span><strong>Select a Type:</strong> Use the dropdown in the sidebar to choose from Attractors, IFS, or Fractals. Each category contains multiple visualization types.</span>
        </UsageItem>
        <UsageItem>
          <StepNumber>2</StepNumber>
          <span><strong>Choose a Preset:</strong> Each type comes with curated presets that demonstrate interesting parameter combinations. Start here to explore!</span>
        </UsageItem>
        <UsageItem>
          <StepNumber>3</StepNumber>
          <span><strong>Edit Parameters:</strong> Click "Edit Parameters" to unlock the controls. Adjust values and watch the visualization update in real-time.</span>
        </UsageItem>
        <UsageItem>
          <StepNumber>4</StepNumber>
          <span><strong>Customize Colors:</strong> Click the palette button to open the color editor. Add, remove, or modify color stops to create your perfect palette.</span>
        </UsageItem>
        <UsageItem>
          <StepNumber>5</StepNumber>
          <span><strong>Navigate Fractals:</strong> For escape-time fractals, use scroll to zoom and drag to pan. Explore the infinite detail at any scale.</span>
        </UsageItem>
        <UsageItem>
          <StepNumber>6</StepNumber>
          <span><strong>Save Your Art:</strong> Click the download button to save your creation as a high-resolution PNG image.</span>
        </UsageItem>
      </UsageList>
    </Section>

    <Section>
      <SectionTitle>Understanding the Parameters</SectionTitle>
      <Paragraph>
        It's not necessary to understand the mathematics to create beautiful images!
        You can experiment by using the presets and adjusting parameters to see how
        changes affect the visualization. However, understanding the math can help
        you predict how parameter changes will affect the output.
      </Paragraph>
      <Paragraph>
        <strong>Scale:</strong> Controls the zoom level of the attractor rendering.
        Smaller values zoom out, larger values zoom in.
      </Paragraph>
      <Paragraph>
        <strong>Iterations:</strong> The number of points calculated. More iterations
        mean more detail but slower rendering.
      </Paragraph>
      <Paragraph>
        <strong>Palette Gamma:</strong> Controls the brightness distribution of the
        color mapping. Lower values brighten shadows, higher values increase contrast.
      </Paragraph>
      <SubTitle>Oversampling (Anti-Aliasing)</SubTitle>
      <Paragraph>
        Chaos Iterator uses <strong>2x oversampling</strong> for smooth, high-quality
        rendering. This means the attractor is computed at twice the display resolution,
        then each 2×2 block of pixels is averaged down to produce the final image.
        This technique eliminates the jagged edges and noise that would otherwise
        appear in fine details, producing smoother gradients and cleaner lines—especially
        visible in the delicate structures of symmetric icons and attractor filaments.
      </Paragraph>
    </Section>
  </>
);

const AttractorsTab: React.FC = () => (
  <>
    <Section>
      <SectionTitle>Strange Attractors</SectionTitle>
      <Paragraph>
        Strange attractors are patterns that emerge from chaotic dynamical systems.
        Despite the underlying chaos, these systems produce beautiful, structured patterns
        that reveal order within complexity.
      </Paragraph>
    </Section>

    <AttractorCard>
      <AttractorName>Symmetric Icons</AttractorName>
      <Paragraph>
        Introduced by mathematicians Michael Field and Martin Golubitsky in their groundbreaking
        book "Symmetry in Chaos" (1992), symmetric icons explore a profound question: can chaotic
        systems produce symmetric patterns? The answer is a beautiful yes. These icons demonstrate
        that order and chaos are not opposites but can coexist in striking visual harmony.
      </Paragraph>
      <ImageGrid>
        <div><GridImage src="/gallery/symmetric-icon-fuzzy-hex-knot.png" alt="Fuzzy Hex Knot" /><ImageLabel>Fuzzy Hex Knot</ImageLabel></div>
        <div><GridImage src="/gallery/symmetric-icon-halloween.png" alt="Halloween" /><ImageLabel>Halloween</ImageLabel></div>
        <div><GridImage src="/gallery/symmetric-icon-christmas-bow.png" alt="Christmas Bow" /><ImageLabel>Christmas Bow</ImageLabel></div>
        <div><GridImage src="/gallery/symmetric-icon-french-glass.png" alt="French Glass" /><ImageLabel>French Glass</ImageLabel></div>
        <div><GridImage src="/gallery/symmetric-icon-lace-by-nine.png" alt="Lace by Nine" /><ImageLabel>Lace by Nine</ImageLabel></div>
        <div><GridImage src="/gallery/symmetric-icon-chaotic-flower.png" alt="Chaotic Flower" /><ImageLabel>Chaotic Flower</ImageLabel></div>
        <div><GridImage src="/gallery/symmetric-icon-emperor-s-cloak.png" alt="Emperor's Cloak" /><ImageLabel>Emperor's Cloak</ImageLabel></div>
        <div><GridImage src="/gallery/symmetric-icon-origami.png" alt="Origami" /><ImageLabel>Origami</ImageLabel></div>
      </ImageGrid>
      <SubTitle>The Mathematics</SubTitle>
      <Paragraph>
        The icons are generated by iterating a complex-valued function derived from the
        logistic map <InlineMath math="f(x) = \lambda x(1-x)" />, one of the simplest systems
        exhibiting chaotic behavior. The function is carefully constructed to preserve
        symmetry while allowing chaotic dynamics:
      </Paragraph>
      <MathBlock>
        <BlockMath math="F(z) = (\lambda + \alpha z\bar{z} + \beta \text{Re}(z^n) + \omega i)z + \gamma\bar{z}^{n-1}" />
      </MathBlock>
      <Paragraph>
        Here <InlineMath math="z" /> is a complex number and <InlineMath math="\bar{z}" /> is
        its complex conjugate. The term <InlineMath math="z\bar{z} = |z|^2" /> represents
        the squared magnitude, while <InlineMath math="\text{Re}(z^n)" /> extracts the real
        part of <InlineMath math="z" /> raised to the <InlineMath math="n" />-th power.
      </Paragraph>
      <SubTitle>Symmetry Groups</SubTitle>
      <Paragraph>
        The parameter <InlineMath math="n" /> (degree) determines the rotational symmetry,
        producing patterns with <InlineMath math="n" />-fold rotational symmetry like regular
        polygons. When <InlineMath math="\omega = 0" />, the attractor exhibits <strong>dihedral
        symmetry</strong> <InlineMath math="D_n" /> (rotational plus reflection symmetry).
        Non-zero <InlineMath math="\omega" /> breaks the reflection symmetry, leaving only
        <strong> cyclic symmetry</strong> <InlineMath math="Z_n" /> (pure rotational symmetry).
      </Paragraph>
      <SubTitle>Parameter Guide</SubTitle>
      <Paragraph>
        Finding beautiful symmetric icons requires careful parameter tuning. Here are the
        constraints and guidelines:
      </Paragraph>
      <Paragraph>
        <strong>Degree (n):</strong> Integer from 3 to 12. Lower values (3-6) produce simpler
        shapes like triangles and hexagons. Higher values (7-12) create more intricate, star-like
        patterns. Most published examples use n = 5, 6, or 7.
      </Paragraph>
      <Paragraph>
        <strong>Lambda (λ):</strong> Typically between -2 and 2. This is the primary "chaos"
        parameter—values near ±1.5 often produce the most interesting results. Values too
        close to 0 may cause the attractor to collapse; values too large cause divergence.
      </Paragraph>
      <Paragraph>
        <strong>Alpha (α):</strong> Usually -2 to 2. Controls the nonlinear scaling based on
        distance from origin. Negative values tend to produce "inward-curling" patterns.
      </Paragraph>
      <Paragraph>
        <strong>Beta (β) and Gamma (γ):</strong> Both typically -2 to 2. These interact with
        the symmetry-preserving terms. Gamma especially affects the "petals" or "arms" of the icon.
      </Paragraph>
      <Paragraph>
        <strong>Omega (ω):</strong> Usually -1 to 1. Set to 0 for reflection symmetry (dihedral).
        Non-zero values create "spinning" asymmetric icons with only rotational symmetry.
      </Paragraph>
      <SubTitle>Example Parameter Sets</SubTitle>
      <Paragraph>
        These known-good combinations produce visually striking icons:
      </Paragraph>
      <MathBlock>
        <BlockMath math="\lambda=1.38, \alpha=-0.42, \beta=0.27, \gamma=0.08, \omega=0.34, n=6" />
        <BlockMath math="\lambda=1.60, \alpha=-1.13, \beta=-0.18, \gamma=0.68, \omega=0.05, n=6" />
        <BlockMath math="\lambda=-1.56, \alpha=1.72, \beta=0.74, \gamma=0.72, \omega=0.26, n=3" />
        <BlockMath math="\lambda=1.46, \alpha=-1.88, \beta=-1.47, \gamma=-0.84, \omega=-0.70, n=4" />
      </MathBlock>
      <SubTitle>Tips for Exploration</SubTitle>
      <Paragraph>
        Start with a known preset and make small adjustments (±0.1) to individual parameters.
        If the attractor disappears or becomes a single point, lambda is likely too extreme.
        If it looks "noisy" without structure, try adjusting alpha and beta. The gamma parameter
        has the most dramatic effect on the overall shape.
      </Paragraph>
      <ParamList>
        <ParamBadge>lambda: -2 to 2</ParamBadge>
        <ParamBadge>alpha: -2 to 2</ParamBadge>
        <ParamBadge>beta: -2 to 2</ParamBadge>
        <ParamBadge>gamma: -2 to 2</ParamBadge>
        <ParamBadge>omega: -1 to 1</ParamBadge>
        <ParamBadge>degree: 3-12</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorName>Symmetric Quilts</AttractorName>
      <Paragraph>
        Also from Field and Golubitsky's "Symmetry in Chaos", quilts extend the icon
        concept by adding translational periodicity. While icons have point symmetry
        (rotations around a single point), quilts have <strong>wallpaper symmetry</strong>—they
        tile the plane infinitely like decorative wallpaper or Islamic geometric art.
      </Paragraph>
      <ImageGrid>
        <div><GridImage src="/gallery/symmetric-quilt-mosque.png" alt="Mosque" /><ImageLabel>Mosque</ImageLabel></div>
        <div><GridImage src="/gallery/symmetric-quilt-flowers.png" alt="Flowers with Ribbons" /><ImageLabel>Flowers with Ribbons</ImageLabel></div>
      </ImageGrid>
      <SubTitle>Wallpaper Groups</SubTitle>
      <Paragraph>
        Mathematicians have proven there are exactly 17 distinct wallpaper symmetry groups—
        the only ways to tile a plane with repeating symmetric patterns. Quilts can exhibit
        several of these groups, combining rotational symmetry with one or two directions
        of translational repetition.
      </Paragraph>
      <MathBlock>
        <BlockMath math="F(z) = (\lambda + \alpha z\bar{z} + \beta \text{Re}(z^n))z + \gamma\bar{z}^{n-1}" />
      </MathBlock>
      <Paragraph>
        The equation is similar to symmetric icons but with constraints that enforce
        periodic tiling. The chaotic trajectories fill in cells that repeat infinitely,
        creating mesmerizing patterns reminiscent of medieval tapestries or mosque
        tile work.
      </Paragraph>
      <ParamList>
        <ParamBadge>lambda</ParamBadge>
        <ParamBadge>alpha</ParamBadge>
        <ParamBadge>beta</ParamBadge>
        <ParamBadge>gamma</ParamBadge>
        <ParamBadge>degree</ParamBadge>
      </ParamList>
    </AttractorCard>

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

    <AttractorCard>
      <AttractorHeader>
        <AttractorName>De Jong Attractors</AttractorName>
        <GalleryImage src="/gallery/dejong.png" alt="De Jong Attractor" />
      </AttractorHeader>
      <AttractorContent>
        <Paragraph>
          Named after Peter de Jong of Phillips Laboratories, this attractor was first
          published in the "Computer Recreations" column of Scientific American in July 1987.
          It has since become a favorite among fractal artists and mathematicians alike.
        </Paragraph>
        <SubTitle>The Equations</SubTitle>
        <Paragraph>
          Similar to the Clifford attractor but using subtraction, creating distinctly
          different visual characteristics:
        </Paragraph>
        <MathBlock>
          <BlockMath math="x_{n+1} = \sin(a \cdot y_n) - \cos(b \cdot x_n)" />
          <BlockMath math="y_{n+1} = \sin(c \cdot x_n) - \cos(d \cdot y_n)" />
        </MathBlock>
        <SubTitle>Bounded Dynamics</SubTitle>
        <Paragraph>
          The attractor is bounded by a circle of radius 2 centered at the origin. All
          trajectories remain within the region <InlineMath math="[-2, 2] \times [-2, 2]" />.
          The De Jong attractor has found applications in cryptography, where its chaotic
          sensitivity to parameters makes it useful for image encryption schemes.
        </Paragraph>
        <SubTitle>Parameter Guide</SubTitle>
        <Paragraph>
          <strong>All parameters (a, b, c, d):</strong> Work well in the range <strong>-3 to +3</strong>,
          though the most interesting patterns typically emerge with values between -2.5 and 2.5.
          The starting point (x₀, y₀) doesn't matter—the attractor converges to the same shape.
        </Paragraph>
        <Paragraph>
          <strong>What to expect:</strong> Random parameters produce four types of behavior:
          (1) <em>Chaos</em>—scattered noise, not interesting; (2) <em>Convergence</em>—points
          collapse to a few locations; (3) <em>Divergence</em>—points escape (rare with this
          bounded system); (4) <em>Strange attractor</em>—the intricate loopy patterns we want.
        </Paragraph>
        <SubTitle>Example Parameter Sets</SubTitle>
        <MathBlock>
          <BlockMath math="a=-2.24,\ b=0.43,\ c=-0.65,\ d=-2.43 \quad \text{(Classic)}" />
          <BlockMath math="a=1.4,\ b=-2.3,\ c=2.4,\ d=-2.1 \quad \text{(Swirl)}" />
          <BlockMath math="a=2.01,\ b=-2.53,\ c=1.61,\ d=-0.33 \quad \text{(Flower)}" />
        </MathBlock>
        <SubTitle>Exploration Tips</SubTitle>
        <Paragraph>
          Finding beautiful De Jong attractors is a "hunting expedition"—try random parameters,
          then make small adjustments when you find something promising. With four 32-bit
          parameters, the odds of anyone else finding the exact same pattern are approximately
          1 in 2¹²⁸—each discovery is likely unique in human history.
        </Paragraph>
        <ParamList>
          <ParamBadge>a: -3 to 3</ParamBadge>
          <ParamBadge>b: -3 to 3</ParamBadge>
          <ParamBadge>c: -3 to 3</ParamBadge>
          <ParamBadge>d: -3 to 3</ParamBadge>
        </ParamList>
      </AttractorContent>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <AttractorName>Svensson Attractors</AttractorName>
        <GalleryImage src="/gallery/svensson.png" alt="Svensson Attractor" />
      </AttractorHeader>
      <AttractorContent>
        <Paragraph>
          Created by Johnny Svensson, this attractor is a variation of the De Jong attractor
          that produces flowing, ribbon-like patterns with striking visual appeal. The key
          difference is in how the parameters multiply the trigonometric terms.
        </Paragraph>
        <SubTitle>The Equations</SubTitle>
        <MathBlock>
          <BlockMath math="x_{n+1} = d \cdot \sin(a \cdot x_n) - \sin(b \cdot y_n)" />
          <BlockMath math="y_{n+1} = c \cdot \cos(a \cdot x_n) + \cos(b \cdot y_n)" />
        </MathBlock>
        <Paragraph>
          Notice that unlike De Jong, the Svensson attractor applies
          parameters <InlineMath math="c" /> and <InlineMath math="d" /> as multipliers
          to the trigonometric terms rather than inside them. This subtle change produces
          dramatically different dynamics, often with more pronounced symmetry and
          smoother curves.
        </Paragraph>
        <SubTitle>Parameter Guide</SubTitle>
        <Paragraph>
          <strong>Parameters a and b:</strong> Control the frequency of oscillation, typically
          in the range <strong>1 to 3</strong>. Values around 1.4-1.6 produce balanced patterns.
        </Paragraph>
        <Paragraph>
          <strong>Parameters c and d:</strong> Act as amplitude multipliers with a wider range,
          typically <strong>-7 to +7</strong>. Parameter d especially affects the horizontal
          spread, and extreme values (like -6.5) can create dramatic ribbon effects.
        </Paragraph>
        <SubTitle>Example Parameter Sets</SubTitle>
        <MathBlock>
          <BlockMath math="a=1.4,\ b=1.56,\ c=1.4,\ d=-6.56 \quad \text{(Ribbon)}" />
          <BlockMath math="a=1.4,\ b=-2.3,\ c=2.4,\ d=-2.1 \quad \text{(Classic)}" />
        </MathBlock>
        <SubTitle>Exploration Tips</SubTitle>
        <Paragraph>
          Start with a and b near 1.5, then experiment with larger values of c and d (especially
          negative d values) to create the characteristic flowing ribbon patterns. The Svensson
          tends to produce more open, flowing shapes compared to the tighter spirals of Clifford.
        </Paragraph>
        <ParamList>
          <ParamBadge>a: 1 to 3</ParamBadge>
          <ParamBadge>b: -3 to 3</ParamBadge>
          <ParamBadge>c: -7 to 7</ParamBadge>
          <ParamBadge>d: -7 to 7</ParamBadge>
        </ParamList>
      </AttractorContent>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <AttractorName>Bedhead Attractors</AttractorName>
        <GalleryImage src="/gallery/bedhead.png" alt="Bedhead Attractor" />
      </AttractorHeader>
      <AttractorContent>
        <Paragraph>
          The Bedhead attractor creates organic, hair-like flowing patterns that resemble
          tangled strands—hence its whimsical name. Unlike other attractors in this family,
          it uses only two parameters but achieves complexity through the interaction
          between <InlineMath math="x" /> and <InlineMath math="y" /> in its equations.
        </Paragraph>
        <SubTitle>The Equations</SubTitle>
        <MathBlock>
          <BlockMath math="x_{n+1} = \sin\left(\frac{x_n \cdot y_n}{b}\right) + \cos(a \cdot x_n - y_n)" />
          <BlockMath math="y_{n+1} = x_n + \frac{\sin(y_n)}{b}" />
        </MathBlock>
        <Paragraph>
          The term <InlineMath math="x_n \cdot y_n / b" /> creates coupling between the
          two variables, while the <InlineMath math="\sin(y_n)/b" /> term in the second
          equation creates the flowing, strand-like appearance. Small values
          of <InlineMath math="b" /> amplify these effects, creating denser tangles.
        </Paragraph>
        <SubTitle>Parameter Guide</SubTitle>
        <Paragraph>
          <strong>Parameter a:</strong> Controls the angular frequency. Range <strong>-1 to 1</strong>,
          with values near 0 (like 0.06) producing the finest detail. Values outside this range
          can cause the attractor to become unstable or overly chaotic.
        </Paragraph>
        <Paragraph>
          <strong>Parameter b:</strong> Acts as a scaling divisor—<strong>critical for stability</strong>.
          Must be non-zero; values near <strong>0.8 to 1.0</strong> work well. Smaller values
          (approaching 0) create denser, more tangled patterns but can cause numerical instability.
          Values significantly larger than 1 flatten the attractor.
        </Paragraph>
        <SubTitle>Example Parameter Sets</SubTitle>
        <MathBlock>
          <BlockMath math="a=0.06,\ b=0.98 \quad \text{(Classic bedhead)}" />
          <BlockMath math="a=-0.81,\ b=0.83 \quad \text{(Dense tangle)}" />
          <BlockMath math="a=0.65,\ b=0.7 \quad \text{(Flowing strands)}" />
        </MathBlock>
        <SubTitle>Warning</SubTitle>
        <Paragraph>
          The Bedhead attractor is sensitive to parameter choices. If b approaches 0, division
          by small numbers causes numerical issues. If the pattern looks blank or scattered,
          try increasing b toward 1.0. Start with the classic values and make small adjustments.
        </Paragraph>
        <ParamList>
          <ParamBadge>a: -1 to 1</ParamBadge>
          <ParamBadge>b: 0.5 to 1.5</ParamBadge>
        </ParamList>
      </AttractorContent>
    </AttractorCard>

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

    <AttractorCard>
      <AttractorName>Hopalong Attractors</AttractorName>
      <Paragraph>
        Created by Barry Martin of Aston University, Birmingham, the Hopalong attractor
        (also called the Martin attractor) was popularized through A.K. Dewdney's
        "Computer Recreations" column in Scientific American (1986). Its name comes from
        the way points seem to "hop" across the plane in discrete jumps.
      </Paragraph>
      <ImageGrid>
        <div><GridImage src="/gallery/hopalong.png" alt="Phoenix" /><ImageLabel>Phoenix</ImageLabel></div>
        <div><GridImage src="/gallery/hopalong-spiral.png" alt="Spiral" /><ImageLabel>Spiral</ImageLabel></div>
      </ImageGrid>
      <SubTitle>The Equations</SubTitle>
      <MathBlock>
        <BlockMath math="x_{n+1} = y_n - \text{sgn}(x_n)\sqrt{|b \cdot x_n - c|}" />
        <BlockMath math="y_{n+1} = a - x_n" />
      </MathBlock>
      <SubTitle>Understanding the Math</SubTitle>
      <Paragraph>
        The <InlineMath math="\text{sgn}(x)" /> function returns -1, 0, or 1 depending on
        whether <InlineMath math="x" /> is negative, zero, or positive. Combined with the
        square root of an absolute value, this creates the characteristic "hopping"
        behavior. The second equation is remarkably simple—just subtracting from a
        constant—yet the interaction produces complex, often symmetric patterns.
      </Paragraph>
      <SubTitle>Parameter Guide</SubTitle>
      <Paragraph>
        <strong>Parameter a:</strong> The "offset" constant, can range widely from <strong>-100 to +100</strong>
        or more. Classic values are small (0.4 to 2.0), but larger values create larger patterns.
        This parameter has the most dramatic effect on overall shape.
      </Paragraph>
      <Paragraph>
        <strong>Parameter b:</strong> Multiplier for the square root term. Typically <strong>-10 to +10</strong>,
        with values near 1 being common. Affects the "spread" and density of the pattern.
      </Paragraph>
      <Paragraph>
        <strong>Parameter c:</strong> Offset inside the square root. Range <strong>-50 to +50</strong>.
        Often set to small values or 0. Affects the symmetry and complexity of the pattern.
      </Paragraph>
      <SubTitle>Example Parameter Sets</SubTitle>
      <MathBlock>
        <BlockMath math="a=-55,\ b=-1,\ c=42 \quad \text{(Classic)}" />
        <BlockMath math="a=2.0,\ b=0.05,\ c=2.0 \quad \text{(Compact spiral)}" />
        <BlockMath math="a=0.4,\ b=1.0,\ c=0.0 \quad \text{(Simple)}" />
        <BlockMath math="a=7.17,\ b=8.44,\ c=2.56 \quad \text{(Complex)}" />
      </MathBlock>
      <SubTitle>Important Note: Not a True Attractor</SubTitle>
      <Paragraph>
        Unlike Clifford or De Jong, the Hopalong is not a true attractor—the pattern depends
        on the starting point (x₀, y₀), not just the parameters. Different initial points
        can produce completely different patterns with the same a, b, c values. This makes
        exploration even more varied: if you find interesting parameters, try different
        starting points to discover new shapes.
      </Paragraph>
      <SubTitle>The Butterfly Effect</SubTitle>
      <Paragraph>
        Hopalong exhibits extreme sensitivity: tiny parameter changes create completely
        different images. This is trial-and-error exploration—when you find something
        promising, make very small adjustments (±0.01) to refine it.
      </Paragraph>
      <ParamList>
        <ParamBadge>a: -100 to 100</ParamBadge>
        <ParamBadge>b: -10 to 10</ParamBadge>
        <ParamBadge>c: -50 to 50</ParamBadge>
      </ParamList>
    </AttractorCard>

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

const IFSTab: React.FC = () => (
  <>
    <Section>
      <SectionTitle>Iterated Function Systems (IFS)</SectionTitle>
      <Paragraph>
        IFS are a method of constructing fractals using a set of contracting maps.
        The resulting fractal is the unique fixed point of the system, often
        visualized using the "chaos game" - repeatedly applying random
        transformations to a point.
      </Paragraph>
    </Section>

    <AttractorCard>
      <AttractorHeader>
        <AttractorName>Symmetric Fractals</AttractorName>
        <GalleryImage src="/gallery/symmetric-fractal.png" alt="Symmetric Fractal" />
      </AttractorHeader>
      <AttractorContent>
        <Paragraph>
          Based on an affine transform combined with random rotations in the symmetry
          group <InlineMath math="Z_p" /> or <InlineMath math="D_p" />, depending
          on the reflect parameter.
        </Paragraph>
        <MathBlock>
          <BlockMath math="\begin{pmatrix} x' \\ y' \end{pmatrix} = \begin{pmatrix} a & b \\ c & d \end{pmatrix} \begin{pmatrix} x \\ y \end{pmatrix} + \begin{pmatrix} \alpha \\ \beta \end{pmatrix}" />
        </MathBlock>
        <Paragraph>
          The most familiar forms are Sierpinski gaskets of various symmetries,
          formed with a transform moving the current point halfway to a fixed point.
        </Paragraph>
        <ParamList>
          <ParamBadge>a, b, c, d</ParamBadge>
          <ParamBadge>alpha</ParamBadge>
          <ParamBadge>beta</ParamBadge>
          <ParamBadge>p (symmetry)</ParamBadge>
          <ParamBadge>reflect</ParamBadge>
        </ParamList>
      </AttractorContent>
    </AttractorCard>

    <AttractorCard>
      <AttractorName>De Rham Curves</AttractorName>
      <Paragraph>
        Named after Georges de Rham, these are IFS transformations given by two
        contracting maps. Includes Cesaro curves (orientation conserving) and
        Koch-Peano curves (orientation reversing).
      </Paragraph>
      <SubTitle>Cesaro Curves (Levy C-curve):</SubTitle>
      <MathBlock>
        <BlockMath math="d_0(z) = az, \quad d_1(z) = a + (1-a)z" />
        <BlockMath math="a = \alpha + \beta i, \quad |a| < 1, \quad |1-a| < 1" />
      </MathBlock>
      <SubTitle>Koch-Peano Curves:</SubTitle>
      <MathBlock>
        <BlockMath math="d_0(z) = a\bar{z}, \quad d_1(z) = a + (1-a)\bar{z}" />
      </MathBlock>
      <ParamList>
        <ParamBadge>alpha</ParamBadge>
        <ParamBadge>beta</ParamBadge>
        <ParamBadge>type</ParamBadge>
      </ParamList>
    </AttractorCard>

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

    <AttractorCard>
      <AttractorName>Mobius Attractors</AttractorName>
      <Paragraph>
        Another attractor from Simone Conradi, using Mobius transformations
        before the random rotation.
      </Paragraph>
      <MathBlock>
        <BlockMath math="f(z) = \frac{az + b}{cz + d} \cdot e^{2\pi i m/n}" />
        <BlockMath math="m = 0, 1, 2, \ldots, n-1" />
      </MathBlock>
      <ParamList>
        <ParamBadge>a, b, c, d</ParamBadge>
        <ParamBadge>n (symmetry)</ParamBadge>
      </ParamList>
    </AttractorCard>
  </>
);

const FractalsTab: React.FC = () => (
  <>
    <Section>
      <SectionTitle>Escape-Time Fractals</SectionTitle>
      <Paragraph>
        Escape-time fractals are generated by iterating a function for each point
        in the complex plane and coloring based on how quickly the iteration
        "escapes" to infinity. The boundary between escaping and non-escaping
        points creates intricate, infinitely detailed patterns.
      </Paragraph>
      <Paragraph>
        The field of complex dynamics began with French mathematicians Pierre Fatou
        and Gaston Julia in the early 20th century. Their work was largely forgotten
        until Benoit Mandelbrot rediscovered it in the 1970s-80s, using computers to
        visualize what Julia and Fatou could only imagine mathematically.
      </Paragraph>
    </Section>

    <AttractorCard>
      <AttractorName>Mandelbrot Set</AttractorName>
      <Paragraph>
        The most famous fractal in mathematics, first visualized by Benoit Mandelbrot
        on March 1, 1980, at IBM's Watson Research Center. The Mandelbrot set has been
        called "the most complex object in mathematics" and serves as a master catalog
        of dynamical systems—connecting to number theory, topology, algebraic geometry,
        and even physics.
      </Paragraph>
      <ImageGrid>
        <div><GridImage src="/gallery/mandelbrot.png" alt="Classic" /><ImageLabel>Classic</ImageLabel></div>
        <div><GridImage src="/gallery/mandelbrot-fire.png" alt="Fire" /><ImageLabel>Fire</ImageLabel></div>
        <div><GridImage src="/gallery/mandelbrot-spiral-galaxy.png" alt="Spiral Galaxy" /><ImageLabel>Spiral Galaxy</ImageLabel></div>
        <div><GridImage src="/gallery/mandelbrot-deep-zoom.png" alt="Deep Zoom" /><ImageLabel>Deep Zoom</ImageLabel></div>
        <div><GridImage src="/gallery/mandelbrot-electric.png" alt="Electric" /><ImageLabel>Electric</ImageLabel></div>
      </ImageGrid>
      <SubTitle>The Iteration</SubTitle>
      <Paragraph>
        For each point <InlineMath math="c" /> in the complex plane, we iterate
        the deceptively simple quadratic polynomial:
      </Paragraph>
      <MathBlock>
        <BlockMath math="z_{n+1} = z_n^2 + c" />
        <BlockMath math="\text{Starting with } z_0 = 0" />
      </MathBlock>
      <SubTitle>The Escape-Time Algorithm</SubTitle>
      <Paragraph>
        The Mandelbrot set consists of all values of <InlineMath math="c" /> for which
        the orbit of 0 remains bounded (never escapes to infinity). Mathematically,
        if <InlineMath math="|z_n| > 2" /> at any point, the sequence will escape to
        infinity. We color each pixel by counting iterations before escape—this is
        the "escape time" algorithm. Points that never escape (the set itself) are
        traditionally colored black.
      </Paragraph>
      <SubTitle>Navigation Guide</SubTitle>
      <Paragraph>
        <strong>Overview:</strong> The main cardioid (heart shape) is centered
        near <InlineMath math="(-0.5, 0)" /> with the circular "head" to the left
        around <InlineMath math="(-1, 0)" />.
      </Paragraph>
      <Paragraph>
        <strong>Interesting Zoom Locations:</strong>
      </Paragraph>
      <Paragraph>
        • <strong>Seahorse Valley:</strong> <InlineMath math="(-0.75, 0.1)" /> — Named
        for its spiral seahorse-like structures. One of the most visually rich regions.
      </Paragraph>
      <Paragraph>
        • <strong>Elephant Valley:</strong> <InlineMath math="(0.275, 0.0)" /> — Between
        the main cardioid and the circular head, featuring elephant trunk shapes.
      </Paragraph>
      <Paragraph>
        • <strong>Lightning:</strong> <InlineMath math="(-1.25, 0.02)" /> — The "antenna"
        region on the left, with delicate lightning bolt structures.
      </Paragraph>
      <Paragraph>
        • <strong>Mini-Mandelbrots:</strong> Found throughout the boundary, especially
        in the antenna. Zoom 10x+ anywhere on the boundary to find embedded copies.
      </Paragraph>
      <Paragraph>
        • <strong>Spiral Arms:</strong> <InlineMath math="(-0.761574, -0.0847596)" /> —
        The Fibonacci spirals visible at the junction between cardioid and head.
      </Paragraph>
      <SubTitle>Iteration Guide</SubTitle>
      <Paragraph>
        <strong>maxIter (Maximum Iterations):</strong> Determines detail level and
        rendering time. Use 100-500 for overview, 500-2000 for moderate zoom, and
        5000+ for deep zooms. Higher iterations reveal finer boundary detail but
        slow rendering.
      </Paragraph>
      <SubTitle>Technical Limits</SubTitle>
      <Paragraph>
        Standard 64-bit floating point allows zooming to about 10¹⁴× magnification.
        Beyond this, numerical precision limits create blocky artifacts. The mathematics
        continues infinitely, but visualization requires specialized "arbitrary precision"
        software for deeper exploration.
      </Paragraph>
      <ParamList>
        <ParamBadge>centerX: -2.5 to 1</ParamBadge>
        <ParamBadge>centerY: -1.5 to 1.5</ParamBadge>
        <ParamBadge>zoom: 0.5 to 10¹⁴</ParamBadge>
        <ParamBadge>maxIter: 100 to 10000+</ParamBadge>
      </ParamList>
    </AttractorCard>

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

    <AttractorCard>
      <AttractorName>Burning Ship</AttractorName>
      <Paragraph>
        Discovered in 1992 by Michael Michelitsch and Otto Rössler, the Burning Ship
        fractal applies a small but significant change to the Mandelbrot formula:
        taking absolute values before squaring. This creates angular, flame-like
        structures instead of the smooth curves of the Mandelbrot set.
      </Paragraph>
      <SubTitle>The Equation</SubTitle>
      <MathBlock>
        <BlockMath math="z_{n+1} = (|\text{Re}(z_n)| + i|\text{Im}(z_n)|)^2 + c" />
      </MathBlock>
      <Paragraph>
        The absolute value operation makes the function <strong>non-analytic</strong>
        (not smooth in the complex analysis sense), which removes the curviness and
        creates sharp angles and lines. Traditionally rendered with the imaginary
        axis inverted, the main structure resembles a ship engulfed in flames—hence
        the name. Like the Mandelbrot set, it contains infinitely many embedded
        "mini-ships" at all scales.
      </Paragraph>
      <SubTitle>Navigation Guide</SubTitle>
      <Paragraph>
        <strong>Overview:</strong> The main ship is centered around <InlineMath math="(-0.4, -0.6)" />
        (with y-axis inverted for the traditional view). The "hull" is the large
        dark region, with flames rising above it.
      </Paragraph>
      <Paragraph>
        <strong>Interesting Locations:</strong>
      </Paragraph>
      <Paragraph>
        • <strong>The Ship Hull:</strong> <InlineMath math="(-1.6, 0)" /> — The main
        ship structure with its characteristic angular "burning" appearance.
      </Paragraph>
      <Paragraph>
        • <strong>Mini-Ships:</strong> <InlineMath math="(-1.755, -0.02)" /> — Embedded
        small ships in the "armada" region to the left of the main ship.
      </Paragraph>
      <Paragraph>
        • <strong>Waterline:</strong> Explore along <InlineMath math="y = 0" /> for
        the junction between ship and water, with curving spires.
      </Paragraph>
      <Paragraph>
        • <strong>Antenna:</strong> The right antenna region shows why it's called
        "Burning Ship"—flame-like structures ascending.
      </Paragraph>
      <SubTitle>Visual Character</SubTitle>
      <Paragraph>
        The angular nature produces patterns resembling lace, crosses, Eiffel towers,
        and other "nightmarish" imagery. Deep zooms reveal mini-ships with their own
        fleets of embedded smaller ships. Some regions have been compared to works
        by Van Gogh and Turner.
      </Paragraph>
      <ParamList>
        <ParamBadge>centerX: -2.5 to 1.5</ParamBadge>
        <ParamBadge>centerY: -2 to 1</ParamBadge>
        <ParamBadge>zoom: 0.5 to 10¹⁴</ParamBadge>
        <ParamBadge>maxIter: 100 to 10000+</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorName>Tricorn (Mandelbar)</AttractorName>
      <Paragraph>
        The Tricorn, also called the Mandelbar set, uses complex conjugation instead
        of simple squaring. This creates a fractal with three-fold symmetry and
        distinctive "horn" structures.
      </Paragraph>
      <SubTitle>The Equation</SubTitle>
      <MathBlock>
        <BlockMath math="z_{n+1} = \bar{z}_n^2 + c" />
      </MathBlock>
      <Paragraph>
        Here <InlineMath math="\bar{z}" /> denotes the complex conjugate
        (negating the imaginary part). This seemingly small change—using
        <InlineMath math="\bar{z}" /> instead of <InlineMath math="z" />—produces
        a fundamentally different fractal with its own family of embedded mini-sets
        and intricate boundary structures.
      </Paragraph>
      <ParamList>
        <ParamBadge>centerX</ParamBadge>
        <ParamBadge>centerY</ParamBadge>
        <ParamBadge>zoom</ParamBadge>
        <ParamBadge>maxIter</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorName>Multibrot</AttractorName>
      <Paragraph>
        The Multibrot sets generalize the Mandelbrot set by using arbitrary powers
        instead of squaring. The standard Mandelbrot set is the Multibrot with
        <InlineMath math="d = 2" />.
      </Paragraph>
      <SubTitle>The Equation</SubTitle>
      <MathBlock>
        <BlockMath math="z_{n+1} = z_n^d + c" />
        <BlockMath math="\text{where } d \text{ is the power/degree}" />
      </MathBlock>
      <SubTitle>Effect of the Power</SubTitle>
      <Paragraph>
        Higher powers create more symmetry: Multibrot-3 has 2-fold symmetry,
        Multibrot-4 has 3-fold, and in general Multibrot-<InlineMath math="d" /> has
        <InlineMath math="(d-1)" />-fold rotational symmetry. The number of "bulbs"
        around the main body increases with the power, creating increasingly
        elaborate patterns.
      </Paragraph>
      <ParamList>
        <ParamBadge>power (d)</ParamBadge>
        <ParamBadge>centerX</ParamBadge>
        <ParamBadge>centerY</ParamBadge>
        <ParamBadge>zoom</ParamBadge>
        <ParamBadge>maxIter</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorName>Newton Fractal</AttractorName>
      <Paragraph>
        Newton fractals arise from applying Newton's root-finding method to complex
        polynomials. The method converges to different roots depending on the starting
        point, and the boundaries between these "basins of attraction" form intricate
        fractal patterns—Julia sets, in fact.
      </Paragraph>
      <SubTitle>Newton's Method</SubTitle>
      <Paragraph>
        To find roots of <InlineMath math="f(z)" />, Newton's method iterates:
      </Paragraph>
      <MathBlock>
        <BlockMath math="z_{n+1} = z_n - \frac{f(z_n)}{f'(z_n)}" />
        <BlockMath math="\text{for polynomial } f(z) = z^n - 1" />
      </MathBlock>
      <SubTitle>Basins of Attraction</SubTitle>
      <Paragraph>
        For <InlineMath math="f(z) = z^3 - 1" />, there are three roots (cube roots
        of unity). Each starting point converges to one of these roots—we color by
        which root and how fast. The boundaries between basins have fractal structure,
        first studied by Arthur Cayley in 1879, who found that even for cubic
        polynomials, the basins have infinitely complex boundaries.
      </Paragraph>
      <SubTitle>Parameter Guide</SubTitle>
      <Paragraph>
        <strong>Power (n):</strong> Determines the polynomial <InlineMath math="z^n - 1" />.
        Range typically <strong>3 to 12</strong>. Each power n creates n roots equally spaced
        around the unit circle. Higher powers create more colors (basins) and more complex
        boundary structures.
      </Paragraph>
      <Paragraph>
        • <strong>n = 3:</strong> Three-fold symmetry, the classic Newton fractal.
      </Paragraph>
      <Paragraph>
        • <strong>n = 4:</strong> Four basins with square symmetry.
      </Paragraph>
      <Paragraph>
        • <strong>n = 5-8:</strong> Increasingly intricate patterns with more arms.
      </Paragraph>
      <SubTitle>Coloring</SubTitle>
      <Paragraph>
        Each root gets its own color (the "basin"). The shade within each basin shows
        convergence speed—darker means faster convergence, lighter means more iterations
        were needed. The fractal structure appears only at the boundaries where basins meet.
      </Paragraph>
      <SubTitle>Where to Look</SubTitle>
      <Paragraph>
        The most interesting regions are the <strong>basin boundaries</strong>—zoom into
        any junction where colors meet. The origin (0, 0) is often a good starting point.
        Boundaries have infinite complexity; zooming reveals ever-finer interweaving of colors.
      </Paragraph>
      <ParamList>
        <ParamBadge>power: 3 to 12</ParamBadge>
        <ParamBadge>zoom: 0.5 to 1000+</ParamBadge>
        <ParamBadge>maxIter: 20 to 500</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <AttractorName>Phoenix Fractal</AttractorName>
        <GalleryImage src="/gallery/phoenix.png" alt="Phoenix Fractal" />
      </AttractorHeader>
      <AttractorContent>
        <Paragraph>
          The Phoenix fractal extends the Julia set formula by incorporating a "memory"
          term—the previous iteration value. This creates more complex dynamics and
          produces distinctive phoenix-like patterns with wing and feather structures.
        </Paragraph>
        <SubTitle>The Equation</SubTitle>
        <MathBlock>
          <BlockMath math="z_{n+1} = z_n^2 + c + p \cdot z_{n-1}" />
          <BlockMath math="\text{where } p \text{ is the phoenix parameter}" />
        </MathBlock>
        <SubTitle>The Memory Effect</SubTitle>
        <Paragraph>
          Unlike the Mandelbrot and Julia sets where each iteration depends only on
          the current value, the Phoenix fractal looks back one step. This "memory"
          creates feedback loops that produce the characteristic layered, feathered
          appearance. The parameter <InlineMath math="p" /> controls how much
          influence the previous iteration has.
        </Paragraph>
        <ParamList>
          <ParamBadge>c</ParamBadge>
          <ParamBadge>p (phoenix)</ParamBadge>
          <ParamBadge>zoom</ParamBadge>
          <ParamBadge>maxIter</ParamBadge>
        </ParamList>
      </AttractorContent>
    </AttractorCard>

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

const AboutTab: React.FC = () => (
  <>
    <Section>
      <SectionTitle>About Chaos Iterator</SectionTitle>
      <Paragraph>
        Chaos Iterator is a web-based tool for exploring the beautiful mathematics
        of chaos theory, strange attractors, and fractals. It brings together
        decades of mathematical discovery into an accessible, interactive
        visualization platform.
      </Paragraph>
      <Paragraph>
        This project is <strong>open source</strong> and available on GitHub. Contributions,
        bug reports, and feature requests are welcome!
      </Paragraph>
      <Paragraph>
        <CreditLink
          href="https://github.com/mannuray/Attractor"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "16px", fontWeight: 600 }}
        >
          View on GitHub →
        </CreditLink>
      </Paragraph>
    </Section>

    <Section>
      <SectionTitle>Inspiration</SectionTitle>
      <Paragraph>
        This project began with the book <strong>"Symmetry in Chaos"</strong> by
        Michael Field and Martin Golubitsky—a stunning exploration of how chaotic
        systems can produce symmetric, beautiful patterns. The mathematics was
        captivating, but I wanted to see it come alive.
      </Paragraph>
      <Paragraph>
        That search led to discovering{" "}
        <CreditLink href="https://symmetrichaos.sourceforge.net/" target="_blank" rel="noopener noreferrer">
          Symmetry in Chaos
        </CreditLink>, a desktop application that implemented Field and Golubitsky's
        symmetric icon algorithms. The program was beautiful—it generated stunning
        symmetric icons that demonstrated the book's ideas perfectly. The preset
        parameter values, color coding system, and palette definitions used in
        Chaos Iterator's symmetric icons are derived directly from Symmetry in Chaos.
      </Paragraph>
      <Paragraph>
        Unfortunately, like many older software projects, Symmetry in Chaos suffered from
        <em> bit rot</em>. Dependencies became outdated, operating systems moved on,
        and running it became increasingly difficult. The beautiful work was becoming
        inaccessible to new generations of chaos enthusiasts.
      </Paragraph>
      <Paragraph>
        <strong>Chaos Iterator is a modern reimagining of that vision.</strong> Built
        for the web, it runs in any browser without installation. It preserves the
        original symmetric icons from Symmetry in Chaos, while expanding the collection
        to include symmetric quilts (from Field and Golubitsky's book), Clifford
        attractors, De Jong attractors, escape-time fractals like Mandelbrot and
        Julia sets, and many more. New features like real-time parameter editing,
        custom color palettes, and high-resolution export make exploration more
        accessible than ever.
      </Paragraph>
      <Paragraph>
        This project is a tribute to Symmetry in Chaos and the mathematicians who revealed
        the hidden order within chaos. Their work deserves to be seen, explored, and
        appreciated—now and for generations to come.
      </Paragraph>
    </Section>

    <Section>
      <SectionTitle>Credits & References</SectionTitle>

      <SubTitle>Mathematical Foundations</SubTitle>
      <Paragraph>
        <strong>"Symmetry and Chaos"</strong> by Michael Field and Martin Golubitsky -
        The primary reference for Symmetric Icons and Quilts.
      </Paragraph>
      <Paragraph>
        <strong>"Chaos in Wonderland"</strong> by Clifford A. Pickover -
        Source for Fractal Dream attractors and various chaos visualizations.
      </Paragraph>
      <Paragraph>
        <strong>J.C. Sprott</strong> - Research on automatic discovery of strange
        attractors using Lyapunov exponents.
      </Paragraph>

      <SubTitle>Attractor Presets & Parameter Values</SubTitle>
      <Paragraph>
        <CreditLink href="https://paulbourke.net/fractals/clifford/" target="_blank" rel="noopener noreferrer">
          Paul Bourke - Clifford Attractors
        </CreditLink> - Comprehensive documentation on Clifford attractor equations and parameter ranges.
      </Paragraph>
      <Paragraph>
        <CreditLink href="https://paulbourke.net/fractals/peterdejong/" target="_blank" rel="noopener noreferrer">
          Paul Bourke - Peter de Jong Attractors
        </CreditLink> - De Jong attractor formulas, example parameters, and visualization techniques.
      </Paragraph>
      <Paragraph>
        <CreditLink href="https://softologyblog.wordpress.com/2017/03/04/2d-strange-attractors/" target="_blank" rel="noopener noreferrer">
          Softology Blog - 2D Strange Attractors
        </CreditLink> - Extensive collection of attractor presets, parameter values, and exploration techniques
        for Clifford, De Jong, Svensson, Bedhead, and many other attractors.
      </Paragraph>
      <Paragraph>
        <CreditLink href="https://chaos.lookoutjames.co.uk/maths.html" target="_blank" rel="noopener noreferrer">
          Lookout James - Chaos Mathematics
        </CreditLink> - Mathematical explanations and parameter guides for symmetric icons, fractals,
        and strange attractors.
      </Paragraph>
      <Paragraph>
        <CreditLink href="https://paulbourke.net/fractals/symmetryinchaos/" target="_blank" rel="noopener noreferrer">
          Paul Bourke - Symmetry in Chaos
        </CreditLink> - Symmetric Icons implementation details and example parameter sets from
        Field & Golubitsky's work.
      </Paragraph>
      <Paragraph>
        <CreditLink href="https://paulbourke.net/fractals/GumowskiMira/" target="_blank" rel="noopener noreferrer">
          Paul Bourke - Gumowski-Mira
        </CreditLink> - Gumowski-Mira attractor equations and parameter exploration.
      </Paragraph>
      <Paragraph>
        <strong>Jason Rampe</strong> - Creator of the Jason Rampe attractor variants.
      </Paragraph>
      <Paragraph>
        <strong>Simone Conradi</strong> - Creator of the Conradi and Mobius IFS attractors.
      </Paragraph>

      <SubTitle>Historical Attributions</SubTitle>
      <Paragraph>
        <strong>Benoit Mandelbrot</strong> - Discovery and popularization of fractal geometry.
      </Paragraph>
      <Paragraph>
        <strong>Gaston Julia</strong> - Early work on iterative functions in the complex plane.
      </Paragraph>
      <Paragraph>
        <strong>Michel Henon</strong> - The Henon map and attractor.
      </Paragraph>
      <Paragraph>
        <strong>Barry Martin</strong> - The Hopalong attractor.
      </Paragraph>
      <Paragraph>
        <strong>I. Gumowski & C. Mira</strong> - CERN research leading to the Gumowski-Mira attractor.
      </Paragraph>
      <Paragraph>
        <strong>Georges de Rham</strong> - De Rham curves.
      </Paragraph>
    </Section>

    <Section>
      <SectionTitle>Technology</SectionTitle>
      <Paragraph>
        Built with React, TypeScript, and styled-components. Mathematical
        visualizations are rendered using HTML5 Canvas with Web Workers for
        performance. Mathematical formulas rendered with KaTeX.
      </Paragraph>
    </Section>

    <CreditSection>
      <Paragraph style={{ opacity: 0.8, fontSize: "14px", marginBottom: "8px" }}>
        Chaos Iterator - Exploring Order in Chaos
      </Paragraph>
      <CreditLink
        href="https://github.com/mannuray/Attractor"
        target="_blank"
        rel="noopener noreferrer"
        style={{ opacity: 0.6, fontSize: "13px" }}
      >
        github.com/mannuray/Attractor
      </CreditLink>
    </CreditSection>
  </>
);

// ============= MAIN COMPONENT =============

type TabType = "usage" | "attractors" | "ifs" | "fractals" | "about";

const Info: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("usage");

  const tabs: { id: TabType; label: string }[] = [
    { id: "usage", label: "How to Use" },
    { id: "attractors", label: "Attractors" },
    { id: "ifs", label: "IFS" },
    { id: "fractals", label: "Fractals" },
    { id: "about", label: "About" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "usage":
        return <HowToUseTab />;
      case "attractors":
        return <AttractorsTab />;
      case "ifs":
        return <IFSTab />;
      case "fractals":
        return <FractalsTab />;
      case "about":
        return <AboutTab />;
      default:
        return <HowToUseTab />;
    }
  };

  return (
    <PageContainer>
      <Header>
        <HeaderTop>
          <BackButton onClick={() => navigate("/")}>
            <span>←</span> Back to Generator
          </BackButton>
          <Title>Chaos Iterator</Title>
        </HeaderTop>
        <TabNav>
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Tab>
          ))}
        </TabNav>
      </Header>

      <Content>
        {renderTabContent()}
      </Content>
    </PageContainer>
  );
};

export default Info;
