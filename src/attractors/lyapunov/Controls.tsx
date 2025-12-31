import React from "react";
import styled from "styled-components";
import { LyapunovParams } from "./types";
import { ParameterInputCompact, ParameterGrid, Card, Field, Label, Input } from "../shared";

const StringInput = styled(Input)`
  font-family: monospace;
  text-transform: uppercase;
`;

interface LyapunovControlsProps {
  params: LyapunovParams;
  onChange: (params: LyapunovParams) => void;
  disabled?: boolean;
}

export const LyapunovControls: React.FC<LyapunovControlsProps> = ({
  params,
  onChange,
  disabled = false,
}) => {
  const handleChange = (key: keyof LyapunovParams) => (value: number) => {
    onChange({ ...params, [key]: value });
  };

  const handleSequenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^AB]/g, "");
    onChange({ ...params, sequence: value });
  };

  return (
    <Card>
      <ParameterGrid>
        <ParameterInputCompact label="A Min" value={params.aMin} onChange={handleChange("aMin")} disabled={disabled} step={0.1} />
        <ParameterInputCompact label="A Max" value={params.aMax} onChange={handleChange("aMax")} disabled={disabled} step={0.1} />
        <ParameterInputCompact label="B Min" value={params.bMin} onChange={handleChange("bMin")} disabled={disabled} step={0.1} />
        <ParameterInputCompact label="B Max" value={params.bMax} onChange={handleChange("bMax")} disabled={disabled} step={0.1} />
      </ParameterGrid>
      <ParameterInputCompact label="Max Iter" value={params.maxIter} onChange={handleChange("maxIter")} disabled={disabled} step={1} />
      <Field>
        <Label>Sequence (A/B only)</Label>
        <StringInput
          type="text"
          value={params.sequence}
          onChange={handleSequenceChange}
          disabled={disabled}
          $editable={!disabled}
          placeholder="AB"
        />
      </Field>
    </Card>
  );
};

export default LyapunovControls;
