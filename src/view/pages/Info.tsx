import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
  color: #ffffff;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 180, 120, 0.15);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
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

const Content = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px 64px;
`;

const Section = styled.section`
  background: rgba(255, 180, 120, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 180, 120, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: rgba(255, 180, 120, 0.9);
  display: flex;
  align-items: center;
  gap: 10px;
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

const CategoryHeader = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 180, 120, 0.15);

  &:hover {
    opacity: 0.9;
  }
`;

const CategoryTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 180, 120, 0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ExpandIcon = styled.span<{ $expanded: boolean }>`
  font-size: 12px;
  color: rgba(255, 180, 120, 0.6);
  transform: rotate(${props => props.$expanded ? "180deg" : "0"});
  transition: transform 0.2s ease;
`;

const AttractorList = styled.div<{ $expanded: boolean }>`
  display: ${props => props.$expanded ? "block" : "none"};
  padding-top: 16px;
`;

const AttractorCard = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 180, 120, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AttractorName = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;

const AttractorDescription = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
`;

const Formula = styled.code`
  display: block;
  background: rgba(0, 0, 0, 0.4);
  padding: 12px;
  border-radius: 8px;
  font-family: "Monaco", "Consolas", monospace;
  font-size: 13px;
  color: rgba(255, 180, 120, 0.9);
  margin-bottom: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
`;

const Parameters = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

// Attractor data
const attractorData = [
  {
    name: "Clifford",
    description: "A strange attractor discovered by Clifford Pickover. Creates intricate swirling patterns using sine and cosine functions.",
    formula: "x' = sin(a*y) + c*cos(a*x)\ny' = sin(b*x) + d*cos(b*y)",
    params: "a (alpha), b (beta), c (gamma), d (delta)"
  },
  {
    name: "De Jong",
    description: "Peter de Jong's attractor creates beautiful symmetric and asymmetric patterns with four parameters.",
    formula: "x' = sin(a*y) - cos(b*x)\ny' = sin(c*x) - cos(d*y)",
    params: "a (alpha), b (beta), c (gamma), d (delta)"
  },
  {
    name: "Tinkerbell",
    description: "Named after the fairy, this attractor creates delicate wing-like patterns. Very sensitive to parameter changes.",
    formula: "x' = x² - y² + a*x + b*y\ny' = 2*x*y + c*x + d*y",
    params: "a (alpha), b (beta), c (gamma), d (delta)"
  },
  {
    name: "Henon",
    description: "One of the most studied strange attractors, discovered by Michel Hénon. Simple but produces complex behavior.",
    formula: "x' = 1 - a*x² + y\ny' = b*x",
    params: "a (alpha), b (beta)"
  },
  {
    name: "Bedhead",
    description: "Creates organic, hair-like flowing patterns. The name comes from its messy, tangled appearance.",
    formula: "x' = sin(x*y/b) + cos(a*x - y)\ny' = x + sin(y)/b",
    params: "a (alpha), b (beta)"
  },
  {
    name: "Svensson",
    description: "Johnny Svensson's attractor creates flowing, ribbon-like patterns with striking symmetry.",
    formula: "x' = d*sin(a*x) - sin(b*y)\ny' = c*cos(a*x) + cos(b*y)",
    params: "a (alpha), b (beta), c (gamma), d (delta)"
  },
  {
    name: "Fractal Dream",
    description: "Creates dreamlike, ethereal patterns with smooth curves and delicate details.",
    formula: "x' = sin(y*b) + c*sin(x*b)\ny' = sin(x*a) + d*sin(y*a)",
    params: "a (alpha), b (beta), c (gamma), d (delta)"
  },
  {
    name: "Hopalong",
    description: "Also known as Martin attractor. Creates symmetric star-like patterns that seem to hop across the plane.",
    formula: "x' = y - sqrt(|b*x - c|) * sign(x)\ny' = a - x",
    params: "a (alpha), b (beta), c (gamma)"
  },
  {
    name: "Gumowski-Mira",
    description: "Creates stunning symmetric patterns resembling butterflies and flowers. Discovered by Gumowski and Mira.",
    formula: "x' = y + a*y*(1-0.05*y²) + f(x)\ny' = -x + f(x')\nwhere f(x) = mu*x + 2*(1-mu)*x²/(1+x²)",
    params: "mu, alpha, sigma"
  },
  {
    name: "Sprott",
    description: "J.C. Sprott's quadratic attractor system. Uses 12 parameters for highly variable patterns.",
    formula: "x' = a1 + a2*x + a3*x² + a4*x*y + a5*y + a6*y²\ny' = a7 + a8*x + a9*x² + a10*x*y + a11*y + a12*y²",
    params: "a1 through a12"
  },
  {
    name: "Symmetric Icon",
    description: "Creates beautiful n-fold symmetric patterns resembling icons or mandalas. Based on complex number rotations.",
    formula: "Complex iteration with n-fold rotational symmetry",
    params: "alpha, beta, gamma, delta, omega, lambda, degree"
  },
  {
    name: "Symmetric Quilt",
    description: "Similar to Symmetric Icon but with additional parameters creating quilt-like tiled patterns.",
    formula: "Complex iteration with quilt-like symmetry",
    params: "alpha, beta, gamma, delta, omega, lambda, degree"
  },
  {
    name: "Jason Rampe 1",
    description: "First of three attractors by Jason Rampe. Creates smooth, flowing curves.",
    formula: "x' = cos(y*b) + c*sin(x*b)\ny' = cos(x*a) + d*sin(y*a)",
    params: "a (alpha), b (beta), c (gamma), d (delta)"
  },
  {
    name: "Jason Rampe 2",
    description: "Second Rampe attractor variant using only cosine functions for smoother patterns.",
    formula: "x' = cos(y*b) + c*cos(x*b)\ny' = cos(x*a) + d*cos(y*a)",
    params: "a (alpha), b (beta), c (gamma), d (delta)"
  },
  {
    name: "Jason Rampe 3",
    description: "Third Rampe attractor mixing sine and cosine for unique wave-like patterns.",
    formula: "x' = sin(y*b) + c*cos(x*b)\ny' = cos(x*a) + d*sin(y*a)",
    params: "a (alpha), b (beta), c (gamma), d (delta)"
  }
];

const ifsData = [
  {
    name: "Symmetric Fractal",
    description: "Iterated Function System creating symmetric fractal patterns through repeated transformations.",
    formula: "Multiple affine transformations with probabilities",
    params: "Symmetry order, transformation coefficients"
  },
  {
    name: "De Rham Curves",
    description: "Named after Georges de Rham. Creates smooth curves through iterated function systems.",
    formula: "Bezier-like curve generation through IFS",
    params: "Control points, iteration depth"
  },
  {
    name: "Conradi",
    description: "Creates intricate branching patterns resembling coral or tree structures.",
    formula: "Branching IFS with multiple transformations",
    params: "Branch angle, scale factors"
  },
  {
    name: "Mobius",
    description: "Uses Mobius transformations to create swirling, hyperbolic patterns.",
    formula: "f(z) = (az + b) / (cz + d) in complex plane",
    params: "Complex coefficients a, b, c, d"
  }
];

const fractalData = [
  {
    name: "Mandelbrot",
    description: "The most famous fractal, discovered by Benoit Mandelbrot. Shows infinite complexity at all scales.",
    formula: "z' = z² + c, starting with z = 0\nColored by escape iteration count",
    params: "Center X, Center Y, Zoom, Max iterations"
  },
  {
    name: "Julia",
    description: "Related to Mandelbrot but with fixed c parameter. Each c value creates a unique Julia set.",
    formula: "z' = z² + c, starting with z = pixel\nColored by escape iteration count",
    params: "c (real), c (imaginary), Zoom, Max iterations"
  },
  {
    name: "Burning Ship",
    description: "A variation of Mandelbrot with absolute values, creating a ship-like silhouette.",
    formula: "z' = (|Re(z)| + i|Im(z)|)² + c",
    params: "Center X, Center Y, Zoom, Max iterations"
  },
  {
    name: "Tricorn",
    description: "Also called Mandelbar. Uses complex conjugate for unique three-horned appearance.",
    formula: "z' = conj(z)² + c",
    params: "Center X, Center Y, Zoom, Max iterations"
  },
  {
    name: "Multibrot",
    description: "Generalization of Mandelbrot with variable exponent. Higher powers create more bulbs.",
    formula: "z' = z^n + c, where n is the power",
    params: "Power (n), Center X, Center Y, Zoom, Max iterations"
  },
  {
    name: "Newton",
    description: "Based on Newton's method for finding roots. Creates intricate basin boundaries.",
    formula: "z' = z - f(z)/f'(z) for polynomial f",
    params: "Polynomial coefficients, Zoom, Max iterations"
  },
  {
    name: "Phoenix",
    description: "A variation using previous iteration values, creating phoenix-like patterns.",
    formula: "z' = z² + c + p*z_prev\nwhere p is the phoenix parameter",
    params: "c, p (phoenix), Zoom, Max iterations"
  },
  {
    name: "Lyapunov",
    description: "Based on Lyapunov exponents of logistic map sequences. Creates unique striped patterns.",
    formula: "x' = r*x*(1-x), r cycles through sequence\nColored by Lyapunov exponent",
    params: "Sequence (e.g., 'AB'), r range"
  }
];

const Info: React.FC = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    attractors: true,
    ifs: false,
    fractals: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate("/")}>
          <span>←</span> Back to Generator
        </BackButton>
        <Title>Chaos Iterator</Title>
      </Header>

      <Content>
        <Section>
          <SectionTitle>How to Use</SectionTitle>
          <UsageList>
            <UsageItem>
              <StepNumber>1</StepNumber>
              <span><strong>Select an attractor type</strong> from the dropdown menu in the sidebar. Choose from Attractors, IFS (Iterated Function Systems), or Fractals.</span>
            </UsageItem>
            <UsageItem>
              <StepNumber>2</StepNumber>
              <span><strong>Choose a preset</strong> to start with interesting parameters, or click "Edit Parameters" to customize values manually.</span>
            </UsageItem>
            <UsageItem>
              <StepNumber>3</StepNumber>
              <span><strong>Adjust the color palette</strong> by clicking the palette button. Add, remove, or modify color stops to create your desired color scheme.</span>
            </UsageItem>
            <UsageItem>
              <StepNumber>4</StepNumber>
              <span><strong>Control the iteration</strong> using Play/Stop. The attractor builds up over time as more points are calculated.</span>
            </UsageItem>
            <UsageItem>
              <StepNumber>5</StepNumber>
              <span><strong>For fractals</strong>, use mouse scroll to zoom and click-drag to pan around. The Reset View button restores the default view.</span>
            </UsageItem>
            <UsageItem>
              <StepNumber>6</StepNumber>
              <span><strong>Save your creation</strong> by clicking the download button. Images are saved as PNG at the selected canvas resolution.</span>
            </UsageItem>
          </UsageList>
        </Section>

        <Section>
          <SectionTitle>Attractor & Fractal Guide</SectionTitle>

          <CategoryHeader $expanded={expandedSections.attractors} onClick={() => toggleSection("attractors")}>
            <CategoryTitle>Strange Attractors ({attractorData.length})</CategoryTitle>
            <ExpandIcon $expanded={expandedSections.attractors}>▼</ExpandIcon>
          </CategoryHeader>
          <AttractorList $expanded={expandedSections.attractors}>
            {attractorData.map(item => (
              <AttractorCard key={item.name}>
                <AttractorName>{item.name}</AttractorName>
                <AttractorDescription>{item.description}</AttractorDescription>
                <Formula>{item.formula}</Formula>
                <Parameters><strong>Parameters:</strong> {item.params}</Parameters>
              </AttractorCard>
            ))}
          </AttractorList>

          <CategoryHeader $expanded={expandedSections.ifs} onClick={() => toggleSection("ifs")}>
            <CategoryTitle>IFS - Iterated Function Systems ({ifsData.length})</CategoryTitle>
            <ExpandIcon $expanded={expandedSections.ifs}>▼</ExpandIcon>
          </CategoryHeader>
          <AttractorList $expanded={expandedSections.ifs}>
            {ifsData.map(item => (
              <AttractorCard key={item.name}>
                <AttractorName>{item.name}</AttractorName>
                <AttractorDescription>{item.description}</AttractorDescription>
                <Formula>{item.formula}</Formula>
                <Parameters><strong>Parameters:</strong> {item.params}</Parameters>
              </AttractorCard>
            ))}
          </AttractorList>

          <CategoryHeader $expanded={expandedSections.fractals} onClick={() => toggleSection("fractals")}>
            <CategoryTitle>Escape-Time Fractals ({fractalData.length})</CategoryTitle>
            <ExpandIcon $expanded={expandedSections.fractals}>▼</ExpandIcon>
          </CategoryHeader>
          <AttractorList $expanded={expandedSections.fractals}>
            {fractalData.map(item => (
              <AttractorCard key={item.name}>
                <AttractorName>{item.name}</AttractorName>
                <AttractorDescription>{item.description}</AttractorDescription>
                <Formula>{item.formula}</Formula>
                <Parameters><strong>Parameters:</strong> {item.params}</Parameters>
              </AttractorCard>
            ))}
          </AttractorList>
        </Section>
      </Content>
    </PageContainer>
  );
};

export default Info;
