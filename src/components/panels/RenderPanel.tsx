import React from "react";
import { Segmented } from "../ui/Segmented";
import { SectionLabel } from "../../attractors/shared/styles";

const SIZES = [800, 1200, 1800, 2400, 3600, 4096];
const QUALITY = [1, 2, 3, 4];

interface Props {
  canvasSize: number; onCanvasSizeChange: (n: number) => void;
  oversampling: number; onOversamplingChange: (n: number) => void;
}

export const RenderPanel: React.FC<Props> = ({ canvasSize, onCanvasSizeChange, oversampling, onOversamplingChange }) => (
  <div>
    <SectionLabel as="div">Size (px)</SectionLabel>
    <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
      <Segmented ariaLabel="Size row 1" size="sm" value={canvasSize} onChange={onCanvasSizeChange}
        options={SIZES.slice(0, 3).map(s => ({ value: s, label: String(s) }))} />
      <Segmented ariaLabel="Size row 2" size="sm" value={canvasSize} onChange={onCanvasSizeChange}
        options={SIZES.slice(3).map(s => ({ value: s, label: String(s) }))} />
    </div>
    <SectionLabel as="div">Quality</SectionLabel>
    <Segmented ariaLabel="Quality" size="sm" value={oversampling} onChange={onOversamplingChange}
      options={QUALITY.map(q => ({ value: q, label: `${q}×` }))} />
  </div>
);
