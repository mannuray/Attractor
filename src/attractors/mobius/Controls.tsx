import React from "react";
import { MobiusParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card } from "../shared";
import { mobiusPresets } from "./config";

interface MobiusControlsProps {
  params: MobiusParams;
  onChange: (params: MobiusParams) => void;
  disabled?: boolean;
  selectedPreset?: number;
  onPresetChange?: (index: number) => void;
}

const presetOptions = mobiusPresets.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const MobiusControls: React.FC<MobiusControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset = 0,
  onPresetChange,
}) => {
  const handleChange = (key: keyof MobiusParams) => (value: number) => {
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
        <ParameterInputCompact label="a (Re)" value={params.aRe} onChange={handleChange("aRe")} disabled={disabled} />
        <ParameterInputCompact label="a (Im)" value={params.aIm} onChange={handleChange("aIm")} disabled={disabled} />
        <ParameterInputCompact label="b (Re)" value={params.bRe} onChange={handleChange("bRe")} disabled={disabled} />
        <ParameterInputCompact label="b (Im)" value={params.bIm} onChange={handleChange("bIm")} disabled={disabled} />
        <ParameterInputCompact label="c (Re)" value={params.cRe} onChange={handleChange("cRe")} disabled={disabled} />
        <ParameterInputCompact label="c (Im)" value={params.cIm} onChange={handleChange("cIm")} disabled={disabled} />
        <ParameterInputCompact label="d (Re)" value={params.dRe} onChange={handleChange("dRe")} disabled={disabled} />
        <ParameterInputCompact label="d (Im)" value={params.dIm} onChange={handleChange("dIm")} disabled={disabled} />
        <ParameterInputCompact label="n" value={params.n} onChange={handleChange("n")} disabled={disabled} step={1} decimals={0} />
      </ParameterGrid>
      <ParameterInputCompact label="Scale" value={params.scale} onChange={handleChange("scale")} disabled={disabled} step={0.01} />
    </Card>
  );
};

export default MobiusControls;
