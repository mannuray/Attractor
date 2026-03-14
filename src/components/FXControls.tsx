import React, { useState } from "react";
import styled from "styled-components";
import { 
  Card, 
  SectionHeader, 
  SectionTitle, 
  CollapseIcon, 
  ParameterGrid, 
  colors
} from "../attractors/shared/styles";
import { ParameterInputCompact } from "../attractors/shared/ParameterInput";

interface FXControlsProps {
  fx: {
    enabled: boolean;
    bloom: number;
    grain: number;
    vignette: number;
    exposure: number;
  };
  onChange: (fx: any) => void;
}

const ToggleButton = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'JetBrains Mono', monospace;
  background: ${props => props.$active ? colors.accent : "transparent"};
  border: 1px solid ${colors.accentBorder};
  border-radius: 4px;
  color: ${props => props.$active ? props.theme.bgPage : colors.accentLight};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.accent};
    background: ${props => props.$active ? colors.accent : colors.accentSubtle};
  }
`;

export const FXControls: React.FC<FXControlsProps> = ({ fx, onChange }) => {
  const [collapsed, setCollapsed] = useState(true);

  const handleToggle = () => onChange({ enabled: !fx.enabled });
  const handleParamChange = (key: string) => (val: number) => onChange({ [key]: val });

  return (
    <Card>
      <SectionHeader onClick={() => setCollapsed(!collapsed)} $collapsed={collapsed}>
        <SectionTitle>Studio.FX</SectionTitle>
        <CollapseIcon $collapsed={collapsed}>▼</CollapseIcon>
      </SectionHeader>

      {!collapsed && (
        <>
          <ToggleButton $active={fx.enabled} onClick={handleToggle}>
            {fx.enabled ? "System: Active" : "System: Standby"}
          </ToggleButton>

          <ParameterGrid>
            <ParameterInputCompact 
              label="Bloom" 
              value={fx.bloom} 
              onChange={handleParamChange("bloom")} 
              min={0} max={1} step={0.01}
              disabled={!fx.enabled}
            />
            <ParameterInputCompact 
              label="Exposure" 
              value={fx.exposure} 
              onChange={handleParamChange("exposure")} 
              min={0.5} max={3} step={0.05}
              disabled={!fx.enabled}
            />
            <ParameterInputCompact 
              label="Grain" 
              value={fx.grain} 
              onChange={handleParamChange("grain")} 
              min={0} max={0.5} step={0.01}
              disabled={!fx.enabled}
            />
            <ParameterInputCompact 
              label="Vignette" 
              value={fx.vignette} 
              onChange={handleParamChange("vignette")} 
              min={0} max={1} step={0.01}
              disabled={!fx.enabled}
            />
          </ParameterGrid>
        </>
      )}
    </Card>
  );
};

export default FXControls;
