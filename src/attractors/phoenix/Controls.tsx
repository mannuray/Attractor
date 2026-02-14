import React from "react";
import { PhoenixParams } from "./types";
import { ParameterInputCompact, ParameterGrid, Card } from "../shared";

interface PhoenixControlsProps {
  params: PhoenixParams;
  onChange: (params: PhoenixParams) => void;
  disabled?: boolean;
}

export const PhoenixControls: React.FC<PhoenixControlsProps> = ({
  params,
  onChange,
  disabled = false,
}) => {
  const handleChange = (key: keyof PhoenixParams) => (value: number) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <Card>
      <ParameterGrid>
        <ParameterInputCompact label="Center X" value={params.centerX} onChange={handleChange("centerX")} disabled={disabled} step={0.001} />
        <ParameterInputCompact label="Center Y" value={params.centerY} onChange={handleChange("centerY")} disabled={disabled} step={0.001} />
        <ParameterInputCompact label="Zoom" value={params.zoom} onChange={handleChange("zoom")} disabled={disabled} step={0.1} />
        <ParameterInputCompact label="Max Iter" value={params.maxIter} onChange={handleChange("maxIter")} disabled={disabled} step={10} min={10} max={5000} decimals={0} />
        <ParameterInputCompact label="C Real" value={params.cReal} onChange={handleChange("cReal")} disabled={disabled} step={0.001} min={-2} max={2} />
        <ParameterInputCompact label="C Imag" value={params.cImag} onChange={handleChange("cImag")} disabled={disabled} step={0.001} min={-2} max={2} />
      </ParameterGrid>
      <ParameterInputCompact label="P (Phoenix)" value={params.p} onChange={handleChange("p")} disabled={disabled} step={0.01} min={-2} max={2} />
    </Card>
  );
};

export default PhoenixControls;
