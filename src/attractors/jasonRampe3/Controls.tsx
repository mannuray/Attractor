import React from "react";
import { JasonRampe3Params } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card } from "../shared";
import { jasonRampe3Data } from "../../Parametersets";

interface JasonRampe3ControlsProps {
  params: JasonRampe3Params;
  onChange: (params: JasonRampe3Params) => void;
  disabled?: boolean;
  selectedPreset?: number;
  onPresetChange?: (index: number) => void;
}

const presetOptions = jasonRampe3Data.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const JasonRampe3Controls: React.FC<JasonRampe3ControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset = 0,
  onPresetChange,
}) => {
  const handleChange = (key: keyof JasonRampe3Params) => (value: number) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <Card>
      {onPresetChange && (
        <PresetSelector
          label="Preset"
          value={selectedPreset}
          options={presetOptions}
          onChange={(v) => onPresetChange(parseInt(v))}
          disabled={disabled}
        />
      )}
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

export default JasonRampe3Controls;
