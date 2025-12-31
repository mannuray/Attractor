import React from "react";
import { SprottParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card } from "../shared";
import { sprottPresets } from "./config";

interface SprottControlsProps {
  params: SprottParams;
  onChange: (params: SprottParams) => void;
  disabled?: boolean;
  selectedPreset?: number;
  onPresetChange?: (index: number) => void;
}

const presetOptions = sprottPresets.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const SprottControls: React.FC<SprottControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset = 0,
  onPresetChange,
}) => {
  const handleChange = (key: keyof SprottParams) => (value: number) => {
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
        <ParameterInputCompact label="a1" value={params.a1} onChange={handleChange("a1")} disabled={disabled} />
        <ParameterInputCompact label="a2" value={params.a2} onChange={handleChange("a2")} disabled={disabled} />
        <ParameterInputCompact label="a3" value={params.a3} onChange={handleChange("a3")} disabled={disabled} />
        <ParameterInputCompact label="a4" value={params.a4} onChange={handleChange("a4")} disabled={disabled} />
        <ParameterInputCompact label="a5" value={params.a5} onChange={handleChange("a5")} disabled={disabled} />
        <ParameterInputCompact label="a6" value={params.a6} onChange={handleChange("a6")} disabled={disabled} />
        <ParameterInputCompact label="a7" value={params.a7} onChange={handleChange("a7")} disabled={disabled} />
        <ParameterInputCompact label="a8" value={params.a8} onChange={handleChange("a8")} disabled={disabled} />
        <ParameterInputCompact label="a9" value={params.a9} onChange={handleChange("a9")} disabled={disabled} />
        <ParameterInputCompact label="a10" value={params.a10} onChange={handleChange("a10")} disabled={disabled} />
        <ParameterInputCompact label="a11" value={params.a11} onChange={handleChange("a11")} disabled={disabled} />
        <ParameterInputCompact label="a12" value={params.a12} onChange={handleChange("a12")} disabled={disabled} />
      </ParameterGrid>
      <ParameterInputCompact label="Scale" value={params.scale} onChange={handleChange("scale")} disabled={disabled} step={0.01} />
    </Card>
  );
};

export default SprottControls;
