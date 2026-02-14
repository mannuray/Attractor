import React from "react";
import { JuliaParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card } from "../shared";
import { juliaData } from "../../Parametersets";

interface JuliaControlsProps {
  params: JuliaParams;
  onChange: (params: JuliaParams) => void;
  disabled?: boolean;
  selectedPreset: number;
  onPresetChange: (index: number) => void;
}

const presetOptions = juliaData.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const JuliaControls: React.FC<JuliaControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset,
  onPresetChange,
}) => {
  const handleChange = (key: keyof JuliaParams) => (value: number) => {
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
        <ParameterInputCompact label="C Real" value={params.cReal} onChange={handleChange("cReal")} disabled={disabled} step={0.001} min={-2} max={2} />
        <ParameterInputCompact label="C Imag" value={params.cImag} onChange={handleChange("cImag")} disabled={disabled} step={0.001} min={-2} max={2} />
        <ParameterInputCompact label="Center X" value={params.centerX} onChange={handleChange("centerX")} disabled={disabled} step={0.001} />
        <ParameterInputCompact label="Center Y" value={params.centerY} onChange={handleChange("centerY")} disabled={disabled} step={0.001} />
        <ParameterInputCompact label="Zoom" value={params.zoom} onChange={handleChange("zoom")} disabled={disabled} step={0.1} />
        <ParameterInputCompact label="Max Iter" value={params.maxIter} onChange={handleChange("maxIter")} disabled={disabled} step={10} min={10} max={5000} decimals={0} />
      </ParameterGrid>
    </Card>
  );
};

export default JuliaControls;
