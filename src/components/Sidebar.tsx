import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { StatsRow, StatLabel, StatValue, Field, Label, Select } from "../attractors/shared/styles";
import { AttractorType } from "../attractors/shared/types";
import { CustomDropdown } from "./CustomDropdown";
import { useTheme } from "../theme/ThemeContext";
import { LiveStats } from "./LiveStats";
import { registry } from "../attractors/registry";

const SidebarContainer = styled.aside<{ $collapsed: boolean }>`
  width: ${props => props.$collapsed ? "70px" : "340px"};
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.glassBg};
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid ${props => props.theme.accentBorder};
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 100;
  overflow: hidden;
`;

const SidebarHeader = styled.div<{ $collapsed: boolean }>`
  background: rgba(0, 0, 0, 0.2);
  padding: ${props => props.$collapsed ? "20px 0" : "24px 20px"};
  border-bottom: 1px solid ${props => props.theme.accentMuted};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-height: 80px;
  box-sizing: border-box;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Title = styled.h1<{ $collapsed: boolean }>`
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
  color: ${props => props.theme.accent};
  display: ${props => props.$collapsed ? "none" : "block"};
  white-space: nowrap;
  text-shadow: 0 0 10px ${props => props.theme.accentMuted};
`;

const InfoButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  background: transparent;
  border: 1px solid ${props => props.theme.accentBorder};
  border-radius: 4px;
  color: ${props => props.theme.accentLight};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.accentSubtle};
    border-color: ${props => props.theme.accent};
    color: white;
  }
`;

const CollapseToggle = styled.button<{ $collapsed: boolean }>`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 32px;
  background: ${props => props.theme.accent};
  border: none;
  border-radius: 4px 0 0 4px;
  color: ${props => props.theme.bgPage};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 101;
  opacity: 0.4;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    width: 20px;
  }

  &::after {
    content: '${props => props.$collapsed ? "›" : "‹"}';
    font-size: 14px;
    font-weight: 900;
  }
`;

const SidebarContent = styled.div<{ $collapsed: boolean }>`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  opacity: ${props => props.$collapsed ? 0 : 1};
  visibility: ${props => props.$collapsed ? "hidden" : "visible"};
  transition: opacity 0.2s ease;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.accentMuted};
    border-radius: 2px;
  }
`;

const SidebarFooter = styled.div<{ $collapsed: boolean }>`
  background: rgba(0, 0, 0, 0.2);
  padding: 12px 20px;
  border-top: 1px solid ${props => props.theme.accentMuted};
  display: ${props => props.$collapsed ? "none" : "block"};
`;

const SettingsCard = styled.div`
  margin-bottom: 16px;
`;

const IconWrapper = styled.div`
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 0 5px ${props => props.theme.accentMuted});
  &:hover {
    transform: scale(1.1);
  }
`;

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
  statsRef: React.MutableRefObject<{ maxHits: number; totalIterations: number }>;
  maxIter?: number;
  rendering?: boolean;
  children: React.ReactNode;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const ComputingValue = styled(StatValue)`
  color: ${props => props.theme.danger};
`;

export const Sidebar: React.FC<SidebarProps> = ({
  attractorType,
  onAttractorTypeChange,
  canvasSize,
  onCanvasSizeChange,
  oversampling,
  onOversamplingChange,
  statsRef,
  maxIter,
  rendering,
  children,
  collapsed,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const { currentTheme, setTheme, availableThemes } = useTheme();
  
  const isFractal = useMemo(() => {
    const module = registry.get(attractorType);
    return module?.category === "Fractals";
  }, [attractorType]);

  const attractorGroups = useMemo(() => {
    const categories: ("Attractors" | "IFS" | "Fractals")[] = ["Attractors", "IFS", "Fractals"];
    return categories.map(cat => ({
      label: cat,
      options: registry.getByCategory(cat).map(m => ({
        value: m.id,
        label: m.label
      }))
    }));
  }, []);

  return (
    <SidebarContainer $collapsed={collapsed}>
      <CollapseToggle $collapsed={collapsed} onClick={onToggleCollapse} title={collapsed ? "Expand Controls" : "Collapse Controls"} />
      
      <SidebarHeader $collapsed={collapsed}>
        {collapsed ? (
          <IconWrapper onClick={onToggleCollapse} title="Expand">💠</IconWrapper>
        ) : (
          <HeaderRow>
            <Title $collapsed={collapsed}>Core.System</Title>
            <InfoButton onClick={() => navigate("/info")} title="Documentation">
              ?
            </InfoButton>
          </HeaderRow>
        )}
      </SidebarHeader>

      <SidebarContent $collapsed={collapsed}>
        <SettingsCard>
          <Field>
            <Label>Dimensions</Label>
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
            <Label>Sampling</Label>
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
            <Label>System.Theme</Label>
            <Select
              value={currentTheme}
              onChange={(e) => setTheme(e.target.value)}
            >
              {availableThemes.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label>Module</Label>
            <CustomDropdown
              value={attractorType}
              onChange={(value) => onAttractorTypeChange(value as AttractorType)}
              groups={attractorGroups}
              placeholder="Select module..."
            />
          </Field>

          {children}
        </SettingsCard>
      </SidebarContent>

      <SidebarFooter $collapsed={collapsed}>
        <StatsRow>
          {rendering ? (
            <>
              <StatLabel>Process</StatLabel>
              <ComputingValue>Computing...</ComputingValue>
            </>
          ) : (
            <>
              <StatLabel>{isFractal ? "Complexity" : "Density"}</StatLabel>
              {isFractal ? (
                <StatValue>{maxIter ?? "—"}</StatValue>
              ) : (
                <LiveStats statsRef={statsRef} />
              )}
            </>
          )}
        </StatsRow>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
