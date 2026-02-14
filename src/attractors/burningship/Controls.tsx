import React from "react";
import { BurningShipParams } from "./types";
import { ParameterInputCompact, ParameterGrid, Card } from "../shared";

interface BurningShipControlsProps {
  params: BurningShipParams;
  onChange: (params: BurningShipParams) => void;
  disabled?: boolean;
}

export const BurningShipControls: React.FC<BurningShipControlsProps> = ({
  params,
  onChange,
  disabled = false,
}) => {
  const handleChange = (key: keyof BurningShipParams) => (value: number) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <Card>
      <ParameterGrid>
        <ParameterInputCompact label="Center X" value={params.centerX} onChange={handleChange("centerX")} disabled={disabled} step={0.001} />
        <ParameterInputCompact label="Center Y" value={params.centerY} onChange={handleChange("centerY")} disabled={disabled} step={0.001} />
        <ParameterInputCompact label="Zoom" value={params.zoom} onChange={handleChange("zoom")} disabled={disabled} step={0.1} />
        <ParameterInputCompact label="Max Iter" value={params.maxIter} onChange={handleChange("maxIter")} disabled={disabled} step={10} min={10} max={5000} decimals={0} />
      </ParameterGrid>
    </Card>
  );
};

export default BurningShipControls;
