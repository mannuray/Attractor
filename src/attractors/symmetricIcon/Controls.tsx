import React from "react";
import { SymmetricIconParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card } from "../shared";
import symmetricIconData from "../../Parametersets";

interface SymmetricIconControlsProps {
  params: SymmetricIconParams;
  onChange: (params: SymmetricIconParams) => void;
  disabled?: boolean;
  selectedPreset: number;
  onPresetChange: (index: number) => void;
}

const presetOptions = symmetricIconData.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const SymmetricIconControls: React.FC<SymmetricIconControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset,
  onPresetChange,
}) => {
  const handleChange = (key: keyof SymmetricIconParams) => (value: number) => {
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
        <ParameterInputCompact label="Alpha" value={params.alpha} onChange={handleChange("alpha")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Beta" value={params.betha} onChange={handleChange("betha")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Gamma" value={params.gamma} onChange={handleChange("gamma")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Delta" value={params.delta} onChange={handleChange("delta")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Omega" value={params.omega} onChange={handleChange("omega")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Lambda" value={params.lambda} onChange={handleChange("lambda")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Degree" value={params.degree} onChange={handleChange("degree")} disabled={disabled} step={1} decimals={0} min={2} max={20} />
        <ParameterInputCompact label="NP Degree" value={params.npdegree} onChange={handleChange("npdegree")} disabled={disabled} step={1} decimals={0} min={0} max={20} />
      </ParameterGrid>
      <ParameterInputCompact label="Scale" value={params.scale} onChange={handleChange("scale")} disabled={disabled} step={0.01} min={0.1} max={10} />
    </Card>
  );
};

export default SymmetricIconControls;
