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
  gap: 16px;
  margin-bottom: 12px;
`;

const Thumbnail = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(255, 180, 120, 0.3);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const AttractorInfo = styled.div`
  flex: 1;
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
        Introduced in "Symmetry and Chaos" by Field and Golubitsky. These icons are
        generated using a complex equation derived from the logistic map, one of the
        simplest equations from which complex behavior arises.
      </Paragraph>
      <MathBlock>
        <BlockMath math="F(z) = (\lambda + \alpha z\bar{z} + \beta \text{Re}(z^n) + \omega i)z + \gamma\bar{z}^{n-1}" />
      </MathBlock>
      <Paragraph>
        The parameter <InlineMath math="n" /> (degree) controls the rotational symmetry.
        Setting <InlineMath math="\omega = 0" /> gives dihedral symmetry; non-zero values
        break it to cyclic symmetry.
      </Paragraph>
      <ParamList>
        <ParamBadge>lambda</ParamBadge>
        <ParamBadge>alpha</ParamBadge>
        <ParamBadge>beta</ParamBadge>
        <ParamBadge>gamma</ParamBadge>
        <ParamBadge>omega</ParamBadge>
        <ParamBadge>delta</ParamBadge>
        <ParamBadge>degree</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/clifford.png" alt="Clifford Attractor" />
        <AttractorInfo>
          <AttractorName>Clifford Attractors</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            Named after Clifford Pickover, these attractors create intricate swirling
            patterns using sine and cosine functions.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="x_{n+1} = \sin(a \cdot y_n) + c \cdot \cos(a \cdot x_n)" />
        <BlockMath math="y_{n+1} = \sin(b \cdot x_n) + d \cdot \cos(b \cdot y_n)" />
      </MathBlock>
      <ParamList>
        <ParamBadge>a (alpha)</ParamBadge>
        <ParamBadge>b (beta)</ParamBadge>
        <ParamBadge>c (gamma)</ParamBadge>
        <ParamBadge>d (delta)</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/dejong.png" alt="De Jong Attractor" />
        <AttractorInfo>
          <AttractorName>De Jong Attractors</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            Peter de Jong's attractor creates beautiful symmetric and asymmetric patterns.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="x_{n+1} = \sin(a \cdot y_n) - \cos(b \cdot x_n)" />
        <BlockMath math="y_{n+1} = \sin(c \cdot x_n) - \cos(d \cdot y_n)" />
      </MathBlock>
      <ParamList>
        <ParamBadge>a (alpha)</ParamBadge>
        <ParamBadge>b (beta)</ParamBadge>
        <ParamBadge>c (gamma)</ParamBadge>
        <ParamBadge>d (delta)</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/svensson.png" alt="Svensson Attractor" />
        <AttractorInfo>
          <AttractorName>Svensson Attractors</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            Johnny Svensson's attractor creates flowing, ribbon-like patterns with striking symmetry.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="x_{n+1} = d \cdot \sin(a \cdot x_n) - \sin(b \cdot y_n)" />
        <BlockMath math="y_{n+1} = c \cdot \cos(a \cdot x_n) + \cos(b \cdot y_n)" />
      </MathBlock>
      <ParamList>
        <ParamBadge>a (alpha)</ParamBadge>
        <ParamBadge>b (beta)</ParamBadge>
        <ParamBadge>c (gamma)</ParamBadge>
        <ParamBadge>d (delta)</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/bedhead.png" alt="Bedhead Attractor" />
        <AttractorInfo>
          <AttractorName>Bedhead Attractors</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            Creates organic, hair-like flowing patterns. The name comes from its messy,
            tangled appearance.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="x_{n+1} = \sin\left(\frac{x_n \cdot y_n}{b}\right) + \cos(a \cdot x_n - y_n)" />
        <BlockMath math="y_{n+1} = x_n + \frac{\sin(y_n)}{b}" />
      </MathBlock>
      <ParamList>
        <ParamBadge>a (alpha)</ParamBadge>
        <ParamBadge>b (beta)</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/fractalDream.png" alt="Fractal Dream Attractor" />
        <AttractorInfo>
          <AttractorName>Fractal Dream Attractors</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            From Clifford A. Pickover's book "Chaos In Wonderland". Creates dreamlike,
            ethereal patterns with smooth curves.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="x_{n+1} = \sin(y_n \cdot b) + c \cdot \sin(x_n \cdot b)" />
        <BlockMath math="y_{n+1} = \sin(x_n \cdot a) + d \cdot \sin(y_n \cdot a)" />
      </MathBlock>
      <ParamList>
        <ParamBadge>a (alpha)</ParamBadge>
        <ParamBadge>b (beta)</ParamBadge>
        <ParamBadge>c (gamma)</ParamBadge>
        <ParamBadge>d (delta)</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/hopalong.png" alt="Hopalong Attractor" />
        <AttractorInfo>
          <AttractorName>Hopalong Attractors</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            Also known as Martin attractor, from Barry Martin. Creates symmetric star-like
            patterns that seem to hop across the plane.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="x_{n+1} = y_n - \text{sgn}(x_n)\sqrt{|b \cdot x_n - c|}" />
        <BlockMath math="y_{n+1} = a - x_n" />
      </MathBlock>
      <ParamList>
        <ParamBadge>a (alpha)</ParamBadge>
        <ParamBadge>b (beta)</ParamBadge>
        <ParamBadge>c (gamma)</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/gumowskiMira.png" alt="Gumowski-Mira Attractor" />
        <AttractorInfo>
          <AttractorName>Gumowski-Mira Attractors</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            Developed in 1980 at CERN by I. Gumowski and C. Mira to calculate trajectories
            of sub-atomic particles. Creates stunning symmetric patterns resembling
            butterflies and flowers.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="f(x) = \mu x + \frac{2(1-\mu)x^2}{1 + x^2}" />
        <BlockMath math="x_{n+1} = y_n + a(1 - b \cdot y_n^2)y_n + f(x_n)" />
        <BlockMath math="y_{n+1} = -x_n + f(x_{n+1})" />
      </MathBlock>
      <ParamList>
        <ParamBadge>mu</ParamBadge>
        <ParamBadge>alpha</ParamBadge>
        <ParamBadge>sigma</ParamBadge>
      </ParamList>
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
        <Thumbnail src="/thumbnails/tinkerbell.png" alt="Tinkerbell Attractor" />
        <AttractorInfo>
          <AttractorName>Tinkerbell Map</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            A discrete-time dynamical system and specialization of the Sprott attractor
            family. Named after the fairy, it creates delicate wing-like patterns.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="x_{n+1} = x_n^2 - y_n^2 + a \cdot x_n + b \cdot y_n" />
        <BlockMath math="y_{n+1} = 2x_n y_n + c \cdot x_n + d \cdot y_n" />
      </MathBlock>
      <ParamList>
        <ParamBadge>a (alpha)</ParamBadge>
        <ParamBadge>b (beta)</ParamBadge>
        <ParamBadge>c (gamma)</ParamBadge>
        <ParamBadge>d (delta)</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/henon.png" alt="Henon Attractor" />
        <AttractorInfo>
          <AttractorName>Henon Attractor</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            One of the most studied strange attractors, discovered by Michel Henon.
            Simple but produces complex behavior.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="x_{n+1} = 1 - a \cdot x_n^2 + y_n" />
        <BlockMath math="y_{n+1} = b \cdot x_n" />
      </MathBlock>
      <ParamList>
        <ParamBadge>a (alpha)</ParamBadge>
        <ParamBadge>b (beta)</ParamBadge>
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
      <AttractorName>Symmetric Fractals</AttractorName>
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
      <AttractorName>Conradi Attractors</AttractorName>
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
    </Section>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/mandelbrot.png" alt="Mandelbrot Set" />
        <AttractorInfo>
          <AttractorName>Mandelbrot Set</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            The most famous fractal, discovered by Benoit Mandelbrot. It shows
            infinite complexity at all scales and is the set of complex numbers
            <InlineMath math="c" /> for which the iteration does not escape.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="z_{n+1} = z_n^2 + c" />
        <BlockMath math="\text{Starting with } z_0 = 0" />
      </MathBlock>
      <Paragraph>
        Points are colored by the number of iterations before <InlineMath math="|z| > 2" />,
        indicating escape.
      </Paragraph>
      <ParamList>
        <ParamBadge>centerX</ParamBadge>
        <ParamBadge>centerY</ParamBadge>
        <ParamBadge>zoom</ParamBadge>
        <ParamBadge>maxIter</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/julia.png" alt="Julia Set" />
        <AttractorInfo>
          <AttractorName>Julia Sets</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            Related to the Mandelbrot set but with a fixed <InlineMath math="c" /> parameter.
            Each value of <InlineMath math="c" /> creates a unique Julia set.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="z_{n+1} = z_n^2 + c" />
        <BlockMath math="\text{Starting with } z_0 = \text{pixel coordinate}" />
      </MathBlock>
      <ParamList>
        <ParamBadge>c (real)</ParamBadge>
        <ParamBadge>c (imaginary)</ParamBadge>
        <ParamBadge>zoom</ParamBadge>
        <ParamBadge>maxIter</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/burningShip.png" alt="Burning Ship" />
        <AttractorInfo>
          <AttractorName>Burning Ship</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            A variation of the Mandelbrot set using absolute values, creating a
            distinctive ship-like silhouette.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="z_{n+1} = (|\text{Re}(z_n)| + i|\text{Im}(z_n)|)^2 + c" />
      </MathBlock>
      <ParamList>
        <ParamBadge>centerX</ParamBadge>
        <ParamBadge>centerY</ParamBadge>
        <ParamBadge>zoom</ParamBadge>
        <ParamBadge>maxIter</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/tricorn.png" alt="Tricorn" />
        <AttractorInfo>
          <AttractorName>Tricorn (Mandelbar)</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            Uses the complex conjugate, creating a unique three-horned appearance.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="z_{n+1} = \bar{z}_n^2 + c" />
      </MathBlock>
      <ParamList>
        <ParamBadge>centerX</ParamBadge>
        <ParamBadge>centerY</ParamBadge>
        <ParamBadge>zoom</ParamBadge>
        <ParamBadge>maxIter</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/multibrot.png" alt="Multibrot" />
        <AttractorInfo>
          <AttractorName>Multibrot</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            Generalization of the Mandelbrot set with variable exponent. Higher powers
            create more bulbs around the main body.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="z_{n+1} = z_n^d + c" />
        <BlockMath math="\text{where } d \text{ is the power/degree}" />
      </MathBlock>
      <ParamList>
        <ParamBadge>power (d)</ParamBadge>
        <ParamBadge>centerX</ParamBadge>
        <ParamBadge>centerY</ParamBadge>
        <ParamBadge>zoom</ParamBadge>
        <ParamBadge>maxIter</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorHeader>
        <Thumbnail src="/thumbnails/newton.png" alt="Newton Fractal" />
        <AttractorInfo>
          <AttractorName>Newton Fractal</AttractorName>
          <Paragraph style={{ margin: 0 }}>
            Based on Newton's method for finding polynomial roots. The fractal shows
            which root each starting point converges to, with intricate basin boundaries.
          </Paragraph>
        </AttractorInfo>
      </AttractorHeader>
      <MathBlock>
        <BlockMath math="z_{n+1} = z_n - \frac{f(z_n)}{f'(z_n)}" />
        <BlockMath math="\text{for polynomial } f(z) = z^n - 1" />
      </MathBlock>
      <ParamList>
        <ParamBadge>power</ParamBadge>
        <ParamBadge>zoom</ParamBadge>
        <ParamBadge>maxIter</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorName>Phoenix Fractal</AttractorName>
      <Paragraph>
        A variation using the previous iteration value, creating phoenix-like patterns.
      </Paragraph>
      <MathBlock>
        <BlockMath math="z_{n+1} = z_n^2 + c + p \cdot z_{n-1}" />
        <BlockMath math="\text{where } p \text{ is the phoenix parameter}" />
      </MathBlock>
      <ParamList>
        <ParamBadge>c</ParamBadge>
        <ParamBadge>p (phoenix)</ParamBadge>
        <ParamBadge>zoom</ParamBadge>
        <ParamBadge>maxIter</ParamBadge>
      </ParamList>
    </AttractorCard>

    <AttractorCard>
      <AttractorName>Lyapunov Fractal</AttractorName>
      <Paragraph>
        Based on Lyapunov exponents of logistic map sequences. Creates unique
        striped patterns based on the sequence string (e.g., "AB", "AABB").
      </Paragraph>
      <MathBlock>
        <BlockMath math="x_{n+1} = r_n \cdot x_n(1 - x_n)" />
        <BlockMath math="\text{where } r_n \text{ cycles through sequence values}" />
      </MathBlock>
      <Paragraph>
        The Lyapunov exponent determines the color:
      </Paragraph>
      <MathBlock>
        <BlockMath math="\lambda = \lim_{n \to \infty} \frac{1}{n} \sum_{i=1}^{n} \log|r_i(1 - 2x_i)|" />
      </MathBlock>
      <ParamList>
        <ParamBadge>sequence</ParamBadge>
        <ParamBadge>r range</ParamBadge>
      </ParamList>
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
        The project is inspired by the work of many mathematicians and programmers
        who have explored these fascinating patterns, including the books
        "Symmetry and Chaos" by Field and Golubitsky, and "Chaos in Wonderland"
        by Clifford Pickover.
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

      <SubTitle>Attractor Presets</SubTitle>
      <Paragraph>
        <CreditLink href="https://paulbourke.net/fractals/" target="_blank" rel="noopener noreferrer">
          Paul Bourke
        </CreditLink> - Extensive documentation on Clifford, De Jong, and other attractors.
      </Paragraph>
      <Paragraph>
        <CreditLink href="https://softologyblog.wordpress.com/" target="_blank" rel="noopener noreferrer">
          Softology Blog
        </CreditLink> - Source for many attractor presets and parameters.
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
      <Paragraph style={{ opacity: 0.6, fontSize: "14px" }}>
        Chaos Iterator - Exploring Order in Chaos
      </Paragraph>
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
