import React from "react";
import { GumowskiMiraParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card } from "../shared";
import { gumowskiMiraPresets } from "./config";

interface GumowskiMiraControlsProps {
  params: GumowskiMiraParams;
  onChange: (params: GumowskiMiraParams) => void;
  disabled?: boolean;
  selectedPreset?: number;
  onPresetChange?: (index: number) => void;
}

const presetOptions = gumowskiMiraPresets.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const GumowskiMiraControls: React.FC<GumowskiMiraControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset = 0,
  onPresetChange,
}) => {
  const handleChange = (key: keyof GumowskiMiraParams) => (value: number) => {
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
        <ParameterInputCompact label="Mu" value={params.mu} onChange={handleChange("mu")} disabled={disabled} />
        <ParameterInputCompact label="Alpha" value={params.alpha} onChange={handleChange("alpha")} disabled={disabled} />
        <ParameterInputCompact label="Sigma" value={params.sigma} onChange={handleChange("sigma")} disabled={disabled} />
      </ParameterGrid>
      <ParameterInputCompact label="Scale" value={params.scale} onChange={handleChange("scale")} disabled={disabled} step={0.01} />
    </Card>
  );
};

export default GumowskiMiraControls;
