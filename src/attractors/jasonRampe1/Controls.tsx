import React from "react";
import { JasonRampe1Params } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card } from "../shared";
import { jasonRampe1Data } from "../../Parametersets";

interface JasonRampe1ControlsProps {
  params: JasonRampe1Params;
  onChange: (params: JasonRampe1Params) => void;
  disabled?: boolean;
  selectedPreset?: number;
  onPresetChange?: (index: number) => void;
}

const presetOptions = jasonRampe1Data.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const JasonRampe1Controls: React.FC<JasonRampe1ControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset = 0,
  onPresetChange,
}) => {
  const handleChange = (key: keyof JasonRampe1Params) => (value: number) => {
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
        <ParameterInputCompact label="Alpha" value={params.alpha} onChange={handleChange("alpha")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Beta" value={params.beta} onChange={handleChange("beta")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Gamma" value={params.gamma} onChange={handleChange("gamma")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Delta" value={params.delta} onChange={handleChange("delta")} disabled={disabled} min={-3} max={3} step={0.01} />
      </ParameterGrid>
      <ParameterInputCompact label="Scale" value={params.scale} onChange={handleChange("scale")} disabled={disabled} step={0.01} min={0.1} max={10} />
    </Card>
  );
};

export default JasonRampe1Controls;
