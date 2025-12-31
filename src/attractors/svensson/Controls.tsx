import React from "react";
import { SvenssonParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card } from "../shared";
import { svenssonData } from "../../Parametersets";

interface SvenssonControlsProps {
  params: SvenssonParams;
  onChange: (params: SvenssonParams) => void;
  disabled?: boolean;
  selectedPreset: number;
  onPresetChange: (index: number) => void;
}

const presetOptions = svenssonData.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const SvenssonControls: React.FC<SvenssonControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset,
  onPresetChange,
}) => {
  const handleChange = (key: keyof SvenssonParams) => (value: number) => {
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
        <ParameterInputCompact label="Alpha" value={params.alpha} onChange={handleChange("alpha")} disabled={disabled} />
        <ParameterInputCompact label="Beta" value={params.beta} onChange={handleChange("beta")} disabled={disabled} />
        <ParameterInputCompact label="Gamma" value={params.gamma} onChange={handleChange("gamma")} disabled={disabled} />
        <ParameterInputCompact label="Delta" value={params.delta} onChange={handleChange("delta")} disabled={disabled} />
      </ParameterGrid>
      <ParameterInputCompact label="Scale" value={params.scale} onChange={handleChange("scale")} disabled={disabled} step={0.01} />
    </Card>
  );
};

export default SvenssonControls;
