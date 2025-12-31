import React, { useState, useRef, useEffect } from "react";
import { Label, ParameterRow, ValueText, ValueInput } from "./styles";
import styled from "styled-components";

const InlineLabel = styled(Label)`
  margin-bottom: 0;
`;

interface EditableValueProps {
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  step?: number;
  min?: number;
  max?: number;
  decimals?: number;
}

const EditableValue: React.FC<EditableValueProps> = ({
  value,
  onChange,
  disabled,
  step = 0.01,
  min,
  max,
  decimals = 4,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync tempValue when external value changes
  useEffect(() => {
    if (!isEditing) {
      setTempValue(value.toString());
    }
  }, [value, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const parsed = parseFloat(tempValue);
    if (!isNaN(parsed)) {
      let finalValue = parsed;
      if (min !== undefined) finalValue = Math.max(min, finalValue);
      if (max !== undefined) finalValue = Math.min(max, finalValue);
      onChange(finalValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTempValue(value.toString());
      setIsEditing(false);
    }
  };

  // Format value - strip trailing zeros for cleaner display
  const formatValue = (val: number) => {
    if (decimals === 0) return Math.round(val).toString();
    const fixed = val.toFixed(decimals);
    // Remove trailing zeros but keep at least one decimal if not integer
    return fixed.replace(/\.?0+$/, '') || '0';
  };

  // View mode: show as text
  if (disabled || !isEditing) {
    return (
      <ValueText
        $clickable={!disabled}
        onClick={() => !disabled && setIsEditing(true)}
      >
        {formatValue(value)}
      </ValueText>
    );
  }

  // Edit mode: show input
  return (
    <ValueInput
      ref={inputRef}
      type="number"
      value={tempValue}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      step={step}
      min={min}
      max={max}
    />
  );
};

interface ParameterInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  step?: number;
  min?: number;
  max?: number;
  decimals?: number;
}

export const ParameterInput: React.FC<ParameterInputProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  step = 0.01,
  min,
  max,
  decimals = 2,
}) => {
  return (
    <ParameterRow>
      <InlineLabel>{label}</InlineLabel>
      <EditableValue
        value={value}
        onChange={onChange}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        decimals={decimals}
      />
    </ParameterRow>
  );
};

// Compact version - same as ParameterInput now (single column layout)
export const ParameterInputCompact: React.FC<ParameterInputProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  step = 0.01,
  min,
  max,
  decimals = 2,
}) => {
  return (
    <ParameterRow>
      <InlineLabel>{label}</InlineLabel>
      <EditableValue
        value={value}
        onChange={onChange}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        decimals={decimals}
      />
    </ParameterRow>
  );
};

export default ParameterInput;
