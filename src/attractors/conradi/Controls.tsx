import React from "react";
import { ConradiParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card, Field, Label, Select } from "../shared";
import { conradiPresets } from "./config";

interface ConradiControlsProps {
  params: ConradiParams;
  onChange: (params: ConradiParams) => void;
  disabled?: boolean;
  selectedPreset?: number;
  onPresetChange?: (index: number) => void;
}

const presetOptions = conradiPresets.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const ConradiControls: React.FC<ConradiControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset = 0,
  onPresetChange,
}) => {
  const handleChange = (key: keyof ConradiParams) => (value: number) => {
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
      <Field>
        <Label>Variant</Label>
        <Select
          value={params.variant}
          onChange={(e) => onChange({ ...params, variant: parseInt(e.target.value) })}
          disabled={disabled}
        >
          <option value={1}>Variant 1</option>
          <option value={2}>Variant 2</option>
        </Select>
      </Field>
      <ParameterGrid>
        <ParameterInputCompact label="r1" value={params.r1} onChange={handleChange("r1")} disabled={disabled} />
        <ParameterInputCompact label="θ1" value={params.theta1} onChange={handleChange("theta1")} disabled={disabled} />
        <ParameterInputCompact label="r2" value={params.r2} onChange={handleChange("r2")} disabled={disabled} />
        <ParameterInputCompact label="θ2" value={params.theta2} onChange={handleChange("theta2")} disabled={disabled} />
        <ParameterInputCompact label="a" value={params.a} onChange={handleChange("a")} disabled={disabled} />
        <ParameterInputCompact label="n" value={params.n} onChange={handleChange("n")} disabled={disabled} step={1} decimals={0} />
      </ParameterGrid>
      <ParameterInputCompact label="Scale" value={params.scale} onChange={handleChange("scale")} disabled={disabled} step={0.01} />
    </Card>
  );
};

export default ConradiControls;
