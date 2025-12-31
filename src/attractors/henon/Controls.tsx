import React from "react";
import { HenonParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card } from "../shared";
import { henonData } from "../../Parametersets";

interface HenonControlsProps {
  params: HenonParams;
  onChange: (params: HenonParams) => void;
  disabled?: boolean;
  selectedPreset: number;
  onPresetChange: (index: number) => void;
}

const presetOptions = henonData.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const HenonControls: React.FC<HenonControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset,
  onPresetChange,
}) => {
  const handleChange = (key: keyof HenonParams) => (value: number) => {
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
      </ParameterGrid>
      <ParameterInputCompact label="Scale" value={params.scale} onChange={handleChange("scale")} disabled={disabled} step={0.01} />
    </Card>
  );
};

export default HenonControls;
