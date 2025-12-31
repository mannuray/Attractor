import React from "react";
import { TinkerbellParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card } from "../shared";
import { tinkerbellData } from "../../Parametersets";

interface TinkerbellControlsProps {
  params: TinkerbellParams;
  onChange: (params: TinkerbellParams) => void;
  disabled?: boolean;
  selectedPreset: number;
  onPresetChange: (index: number) => void;
}

const presetOptions = tinkerbellData.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const TinkerbellControls: React.FC<TinkerbellControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset,
  onPresetChange,
}) => {
  const handleChange = (key: keyof TinkerbellParams) => (value: number) => {
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

export default TinkerbellControls;
