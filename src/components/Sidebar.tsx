import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { GlassPanel, SectionHeader, SectionTitle, StatsRow, StatLabel, StatValue, Field, Label, Select } from "../attractors/shared/styles";
import { AttractorType, formatCompact } from "../attractors/shared/types";
import { CustomDropdown } from "./CustomDropdown";

const SidebarContainer = styled.aside`
  width: 340px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 180, 120, 0.15);
`;

const SidebarHeader = styled.div`
  position: sticky;
  top: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  padding: 20px;
  border-bottom: 1px solid rgba(255, 180, 120, 0.15);
  z-index: 10;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const InfoButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: rgba(255, 180, 120, 0.1);
  border: 1px solid rgba(255, 180, 120, 0.25);
  border-radius: 8px;
  color: rgba(255, 180, 120, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 180, 120, 0.2);
    border-color: rgba(255, 180, 120, 0.4);
    color: rgba(255, 180, 120, 1);
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 180, 120, 0.3);
    border-radius: 3px;
  }
`;

const SidebarFooter = styled.div`
  background: rgba(0, 0, 0, 0.4);
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 180, 120, 0.15);
`;

const SettingsCard = styled(GlassPanel)`
  padding: 16px;
  margin-bottom: 16px;
`;

const EditButton = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 10px 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  background: ${props => props.$active
    ? "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)"
    : "rgba(0, 0, 0, 0.3)"};
  border: 1px solid ${props => props.$active
    ? "transparent"
    : "rgba(255, 180, 120, 0.3)"};
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active
      ? "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)"
      : "rgba(0, 0, 0, 0.4)"};
    border-color: rgba(255, 180, 120, 0.4);
  }
`;

const ATTRACTOR_OPTIONS: { value: AttractorType; label: string }[] = [
  { value: "symmetric_icon", label: "Symmetric Icon" },
  { value: "symmetric_quilt", label: "Symmetric Quilt" },
  { value: "clifford", label: "Clifford" },
  { value: "dejong", label: "De Jong" },
  { value: "tinkerbell", label: "Tinkerbell" },
  { value: "henon", label: "Henon" },
  { value: "bedhead", label: "Bedhead" },
  { value: "svensson", label: "Svensson" },
  { value: "fractal_dream", label: "Fractal Dream" },
  { value: "hopalong", label: "Hopalong" },
  { value: "gumowski_mira", label: "Gumowski-Mira" },
  { value: "sprott", label: "Sprott" },
  { value: "jason_rampe1", label: "Jason Rampe 1" },
  { value: "jason_rampe2", label: "Jason Rampe 2" },
  { value: "jason_rampe3", label: "Jason Rampe 3" },
];

const IFS_OPTIONS: { value: AttractorType; label: string }[] = [
  { value: "symmetric_fractal", label: "Symmetric Fractal" },
  { value: "derham", label: "De Rham Curves" },
  { value: "conradi", label: "Conradi" },
  { value: "mobius", label: "Mobius" },
];

const FRACTAL_OPTIONS: { value: AttractorType; label: string }[] = [
  { value: "mandelbrot", label: "Mandelbrot" },
  { value: "julia", label: "Julia" },
  { value: "burningship", label: "Burning Ship" },
  { value: "tricorn", label: "Tricorn" },
  { value: "multibrot", label: "Multibrot" },
  { value: "newton", label: "Newton" },
  { value: "phoenix", label: "Phoenix" },
  { value: "lyapunov", label: "Lyapunov" },
];

const ATTRACTOR_GROUPS = [
  { label: "Attractors", options: ATTRACTOR_OPTIONS },
  { label: "IFS", options: IFS_OPTIONS },
  { label: "Fractals", options: FRACTAL_OPTIONS },
];

const CANVAS_SIZE_OPTIONS = [
  { value: 800, label: "800 × 800" },
  { value: 1200, label: "1200 × 1200" },
  { value: 1800, label: "1800 × 1800" },
  { value: 2400, label: "2400 × 2400" },
  { value: 3600, label: "3600 × 3600" },
  { value: 4096, label: "4096 × 4096" },
];

const OVERSAMPLING_OPTIONS = [
  { value: 1, label: "1× (Fast)" },
  { value: 2, label: "2× (Standard)" },
  { value: 3, label: "3× (High)" },
  { value: 4, label: "4× (Ultra)" },
];

interface SidebarProps {
  attractorType: AttractorType;
  onAttractorTypeChange: (type: AttractorType) => void;
  canvasSize: number;
  onCanvasSizeChange: (size: number) => void;
  oversampling: number;
  onOversamplingChange: (oversampling: number) => void;
  maxHits: number;
  totalIterations: number;
  maxIter?: number;
  isEditing: boolean;
  onToggleEdit: () => void;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  attractorType,
  onAttractorTypeChange,
  canvasSize,
  onCanvasSizeChange,
  oversampling,
  onOversamplingChange,
  maxHits,
  totalIterations,
  maxIter,
  isEditing,
  onToggleEdit,
  children,
}) => {
  const navigate = useNavigate();
  const isFractal = ["mandelbrot", "julia", "burningship", "tricorn", "multibrot", "newton", "phoenix", "lyapunov"].includes(attractorType);

  return (
    <SidebarContainer>
      <SidebarHeader>
        <HeaderRow>
          <Title>Chaos Iterator</Title>
          <InfoButton onClick={() => navigate("/info")} title="Info & Help">
            ?
          </InfoButton>
        </HeaderRow>
      </SidebarHeader>

      <SidebarContent>
        <SettingsCard>
          <SectionHeader as="div" style={{ cursor: "default" }}>
            <SectionTitle>Settings</SectionTitle>
          </SectionHeader>

          <Field>
                <Label>Canvas Size</Label>
                <Select
                  value={canvasSize}
                  onChange={(e) => onCanvasSizeChange(parseInt(e.target.value))}
                >
                  {CANVAS_SIZE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </Field>

              <Field>
                <Label>Oversampling</Label>
                <Select
                  value={oversampling}
                  onChange={(e) => onOversamplingChange(parseInt(e.target.value))}
                >
                  {OVERSAMPLING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </Field>

              <Field>
                <Label>Attractor Type</Label>
                <CustomDropdown
                  value={attractorType}
                  onChange={(value) => onAttractorTypeChange(value as AttractorType)}
                  groups={ATTRACTOR_GROUPS}
                  placeholder="Select attractor..."
                />
              </Field>

              <EditButton $active={isEditing} onClick={onToggleEdit}>
                {isEditing ? "🔓 Lock Parameters" : "✏️ Edit Parameters"}
              </EditButton>

          {children}
        </SettingsCard>
      </SidebarContent>

      <SidebarFooter>
        <StatsRow>
          <StatLabel>Hits/Iteration</StatLabel>
          <span>
            <StatValue>{formatCompact(maxHits)}</StatValue>
            <StatLabel> / </StatLabel>
            <StatValue>{formatCompact(totalIterations)}</StatValue>
            {isFractal && maxIter && (
              <StatLabel> ({maxIter})</StatLabel>
            )}
          </span>
        </StatsRow>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
