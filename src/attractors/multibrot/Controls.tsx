import React from "react";
import { MultibrotParams } from "./types";
import { ParameterInputCompact, ParameterGrid, Card } from "../shared";

interface MultibrotControlsProps {
  params: MultibrotParams;
  onChange: (params: MultibrotParams) => void;
  disabled?: boolean;
}

export const MultibrotControls: React.FC<MultibrotControlsProps> = ({
  params,
  onChange,
  disabled = false,
}) => {
  const handleChange = (key: keyof MultibrotParams) => (value: number) => {
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
      <ParameterInputCompact label="Power" value={params.power} onChange={handleChange("power")} disabled={disabled} step={1} min={2} max={10} />
    </Card>
  );
};

export default MultibrotControls;
