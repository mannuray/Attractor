import React from "react";
import { SymmetricFractalParams } from "./types";
import { ParameterInputCompact, ParameterGrid, PresetSelector, Card, Field, Label, Select } from "../shared";
import { symmetricFractalPresets } from "./config";

interface SymmetricFractalControlsProps {
  params: SymmetricFractalParams;
  onChange: (params: SymmetricFractalParams) => void;
  disabled?: boolean;
  selectedPreset?: number;
  onPresetChange?: (index: number) => void;
}

const presetOptions = symmetricFractalPresets.map((preset, index) => ({
  value: index,
  label: preset.name,
}));

export const SymmetricFractalControls: React.FC<SymmetricFractalControlsProps> = ({
  params,
  onChange,
  disabled = false,
  selectedPreset = 0,
  onPresetChange,
}) => {
  const handleChange = (key: keyof SymmetricFractalParams) => (value: number) => {
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
        <ParameterInputCompact label="a" value={params.a} onChange={handleChange("a")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="b" value={params.b} onChange={handleChange("b")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="c" value={params.c} onChange={handleChange("c")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="d" value={params.d} onChange={handleChange("d")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Alpha" value={params.alpha} onChange={handleChange("alpha")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Beta" value={params.beta} onChange={handleChange("beta")} disabled={disabled} min={-3} max={3} step={0.01} />
        <ParameterInputCompact label="Symmetry (p)" value={params.p} onChange={handleChange("p")} disabled={disabled} step={1} decimals={0} min={2} max={20} />
      </ParameterGrid>
      <Field>
        <Label>Symmetry Type</Label>
        <Select
          value={params.reflect ? "dihedral" : "cyclic"}
          onChange={(e) => onChange({ ...params, reflect: e.target.value === "dihedral" })}
          disabled={disabled}
        >
          <option value="dihedral">Dihedral (Dp)</option>
          <option value="cyclic">Cyclic (Zp)</option>
        </Select>
      </Field>
      <ParameterInputCompact label="Scale" value={params.scale} onChange={handleChange("scale")} disabled={disabled} step={0.01} min={0.1} max={10} />
    </Card>
  );
};

export default SymmetricFractalControls;
