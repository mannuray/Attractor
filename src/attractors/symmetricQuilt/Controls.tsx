import React from "react";
import { SymmetricQuiltParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card } from "../shared";
import { symmetricQuiltData } from "../../Parametersets";

interface SymmetricQuiltControlsProps {
  params: SymmetricQuiltParams;
  onChange: (params: SymmetricQuiltParams) => void;
  disabled?: boolean;
  selectedPreset: number;
  onPresetChange: (index: number) => void;
}

const presetOptions = symmetricQuiltData.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const SymmetricQuiltControls: React.FC<SymmetricQuiltControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset,
  onPresetChange,
}) => {
  const handleChange = (key: keyof SymmetricQuiltParams) => (value: number) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <Card>
      <PresetSelector
        label="Preset"
        value={selectedPreset}
        options={presetOptions}
        onChange={(v) => onPresetChange(parseInt(v))}
        disabled={disabled}
      />
      <ParameterGrid>
        <ParameterInputCompact label="Lambda" value={params.lambda} onChange={handleChange("lambda")} disabled={disabled} />
        <ParameterInputCompact label="Alpha" value={params.alpha} onChange={handleChange("alpha")} disabled={disabled} />
        <ParameterInputCompact label="Beta" value={params.beta} onChange={handleChange("beta")} disabled={disabled} />
        <ParameterInputCompact label="Gamma" value={params.gamma} onChange={handleChange("gamma")} disabled={disabled} />
        <ParameterInputCompact label="Omega" value={params.omega} onChange={handleChange("omega")} disabled={disabled} />
        <ParameterInputCompact label="M" value={params.m} onChange={handleChange("m")} disabled={disabled} />
        <ParameterInputCompact label="Shift" value={params.shift} onChange={handleChange("shift")} disabled={disabled} />
        <ParameterInputCompact label="Scale" value={params.scale} onChange={handleChange("scale")} disabled={disabled} step={0.01} />
      </ParameterGrid>
    </Card>
  );
};

export default SymmetricQuiltControls;
