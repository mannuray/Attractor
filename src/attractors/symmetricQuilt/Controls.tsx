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
        <ParameterInputCompact label="Lambda" value={params.lambda} onChange={handleChange("lambda")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Alpha" value={params.alpha} onChange={handleChange("alpha")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Beta" value={params.beta} onChange={handleChange("beta")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Gamma" value={params.gamma} onChange={handleChange("gamma")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Omega" value={params.omega} onChange={handleChange("omega")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="M" value={params.m} onChange={handleChange("m")} disabled={disabled} min={1} max={20} step={1} decimals={0} />
        <ParameterInputCompact label="Shift" value={params.shift} onChange={handleChange("shift")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Scale" value={params.scale} onChange={handleChange("scale")} disabled={disabled} step={0.01} min={0.1} max={10} />
      </ParameterGrid>
    </Card>
  );
};

export default SymmetricQuiltControls;
