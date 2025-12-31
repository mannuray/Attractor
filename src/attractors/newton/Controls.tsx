import React from "react";
import { NewtonParams } from "./types";
import { ParameterInputCompact, ParameterGrid, Card } from "../shared";

interface NewtonControlsProps {
  params: NewtonParams;
  onChange: (params: NewtonParams) => void;
  disabled?: boolean;
}

export const NewtonControls: React.FC<NewtonControlsProps> = ({
  params,
  onChange,
  disabled = false,
}) => {
  const handleChange = (key: keyof NewtonParams) => (value: number) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <Card>
      <ParameterGrid>
        <ParameterInputCompact label="Center X" value={params.centerX} onChange={handleChange("centerX")} disabled={disabled} step={0.001} />
        <ParameterInputCompact label="Center Y" value={params.centerY} onChange={handleChange("centerY")} disabled={disabled} step={0.001} />
        <ParameterInputCompact label="Zoom" value={params.zoom} onChange={handleChange("zoom")} disabled={disabled} step={0.1} />
        <ParameterInputCompact label="Max Iter" value={params.maxIter} onChange={handleChange("maxIter")} disabled={disabled} step={1} />
      </ParameterGrid>
    </Card>
  );
};

export default NewtonControls;
