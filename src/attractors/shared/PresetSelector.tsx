import React from "react";
import { Field, Label, Select } from "./styles";

interface PresetOption {
  value: string | number;
  label: string;
}

interface PresetSelectorProps {
  label: string;
  value: string | number;
  options: PresetOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
}) => {
  return (
    <Field>
      <Label>{label}</Label>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
};

export default PresetSelector;
