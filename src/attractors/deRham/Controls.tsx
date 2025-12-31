import React from "react";
import { DeRhamParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card, Field, Label, Select } from "../shared";
import { deRhamPresets } from "./config";

interface DeRhamControlsProps {
  params: DeRhamParams;
  onChange: (params: DeRhamParams) => void;
  disabled?: boolean;
  selectedPreset?: number;
  onPresetChange?: (index: number) => void;
}

const presetOptions = deRhamPresets.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const DeRhamControls: React.FC<DeRhamControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset = 0,
  onPresetChange,
}) => {
  const handleChange = (key: keyof DeRhamParams) => (value: number) => {
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
        <Label>Curve Type</Label>
        <Select
          value={params.curveType}
          onChange={(e) => onChange({ ...params, curveType: e.target.value as DeRhamParams["curveType"] })}
          disabled={disabled}
        >
          <option value="cesaro">Cesaro</option>
          <option value="koch">Koch-Peano</option>
          <option value="general">General</option>
        </Select>
      </Field>
      <ParameterGrid>
        <ParameterInputCompact label="Alpha" value={params.alpha} onChange={handleChange("alpha")} disabled={disabled} />
        <ParameterInputCompact label="Beta" value={params.beta} onChange={handleChange("beta")} disabled={disabled} />
      </ParameterGrid>
      <ParameterInputCompact label="Scale" value={params.scale} onChange={handleChange("scale")} disabled={disabled} step={0.01} />
    </Card>
  );
};

export default DeRhamControls;
