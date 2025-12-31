import React from "react";
import { MandelbrotParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card } from "../shared";
import { mandelbrotData } from "../../Parametersets";

interface MandelbrotControlsProps {
  params: MandelbrotParams;
  onChange: (params: MandelbrotParams) => void;
  disabled?: boolean;
  selectedPreset: number;
  onPresetChange: (index: number) => void;
}

const presetOptions = mandelbrotData.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const MandelbrotControls: React.FC<MandelbrotControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset,
  onPresetChange,
}) => {
  const handleChange = (key: keyof MandelbrotParams) => (value: number) => {
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
        <ParameterInputCompact label="Center X" value={params.centerX} onChange={handleChange("centerX")} disabled={disabled} step={0.001} />
        <ParameterInputCompact label="Center Y" value={params.centerY} onChange={handleChange("centerY")} disabled={disabled} step={0.001} />
        <ParameterInputCompact label="Zoom" value={params.zoom} onChange={handleChange("zoom")} disabled={disabled} step={0.1} />
        <ParameterInputCompact label="Max Iter" value={params.maxIter} onChange={handleChange("maxIter")} disabled={disabled} step={1} />
      </ParameterGrid>
    </Card>
  );
};

export default MandelbrotControls;
