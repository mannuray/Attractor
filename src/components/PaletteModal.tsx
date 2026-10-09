import React, { lazy, Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { Color } from "../model-controller/Attractor/palette";
import { Field, Label, Input, Select, FlexRow, SliderInput } from "../attractors/shared/styles";
import { IconButton } from "./ui/IconButton";
import { tokens } from "../theme/tokens";
import { ColorPickerPopup, RGB } from "../view/components/colorbar";
import { ModalOverlay, ModalContent, ModalHeader, ModalTitle, CloseButton } from "./ModalStyles";

const ColorBar = lazy(() => import("../view/components/colorbar"));

const ColorBarWrapper = styled.div`
  margin-bottom: 24px;
  background: ${p => p.theme.surface};
  padding: 12px;
  border-radius: 10px;
  border: 1px solid ${p => p.theme.hairline};
`;

const ColorPickerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${p => p.theme.surface};
  padding: 10px;
  border-radius: 10px;
  border: 1px solid ${p => p.theme.hairline};
`;

const ColorPreview = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => props.$color};
  border: 1px solid ${p => p.theme.hairlineStrong};
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${p => p.theme.focusBorder};
  }
`;

const ColorValueLabel = styled.span`
  color: ${p => p.theme.textMid};
  font: 500 12px ${tokens.font.mono};
  cursor: pointer;

  &:hover {
    color: ${p => p.theme.textHigh};
  }
`;

interface BgColor {
  r: number;
  g: number;
  b: number;
}

interface PaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  paletteData: Color[];
  onPaletteChange: (colors: Color[]) => void;
  palGamma: number;
  onGammaChange: (gamma: number) => void;
  palScale: boolean;
  onScaleModeChange: (isDynamic: boolean) => void;
  palMax: number;
  onPalMaxChange: (max: number) => void;
  bgColor: BgColor;
  onBgColorChange: (color: BgColor) => void;
}

export const PaletteModal: React.FC<PaletteModalProps> = ({
  isOpen,
  onClose,
  paletteData,
  onPaletteChange,
  palGamma,
  onGammaChange,
  palScale,
  onScaleModeChange,
  palMax,
  onPalMaxChange,
  bgColor,
  onBgColorChange,
}) => {
  const [bgPickerOpen, setBgPickerOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || bgPickerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, bgPickerOpen, onClose]);

  if (!isOpen) return null;

  const bgColorHex = `#${bgColor.r.toString(16).padStart(2, '0')}${bgColor.g.toString(16).padStart(2, '0')}${bgColor.b.toString(16).padStart(2, '0')}`;

  const handleBgColorFromPicker = (color: RGB) => {
    onBgColorChange({ r: color.red, g: color.green, b: color.blue });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent role="dialog" aria-modal="true" aria-labelledby="palette-title" onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle id="palette-title">Palette</ModalTitle>
          <CloseButton aria-label="Close" onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ColorBarWrapper>
          <Suspense fallback={<div style={{ height: 40, background: 'rgba(0,0,0,0.2)', borderRadius: 4 }} />}>
            <ColorBar
              palletteArg={paletteData}
              changePalletCallback={onPaletteChange}
            />
          </Suspense>
        </ColorBarWrapper>

        <Field>
          <Label>Gamma ({palGamma.toFixed(2)})</Label>
          <SliderInput
            min="0.1"
            max="2.5"
            step="0.01"
            value={palGamma}
            onChange={(e) => onGammaChange(parseFloat(e.target.value))}
            style={{ '--val': `${((palGamma - 0.1) / 2.4) * 100}%` } as React.CSSProperties}
          />
        </Field>

        <Field>
          <Label>Normalize</Label>
          <Select
            value={palScale ? "dynamic" : "fixed"}
            onChange={(e) => onScaleModeChange(e.target.value === "dynamic")}
          >
            <option value="dynamic">Auto (peak)</option>
            <option value="fixed">Manual (max)</option>
          </Select>
        </Field>

        {!palScale && (
          <Field>
            <Label>Max</Label>
            <Input
              type="number"
              value={palMax}
              onChange={(e) => onPalMaxChange(parseInt(e.target.value) || 1000)}
              $editable
              min={100}
              step={100}
            />
          </Field>
        )}

        <Field>
          <Label>Background</Label>
          <ColorPickerWrapper>
            <ColorPreview
              $color={bgColorHex}
              onClick={() => setBgPickerOpen(true)}
              style={{ cursor: "pointer" }}
            />
            <ColorValueLabel onClick={() => setBgPickerOpen(true)}>
              {bgColorHex.toUpperCase()}
            </ColorValueLabel>
          </ColorPickerWrapper>
        </Field>

        <FlexRow $justify="flex-end" style={{ marginTop: 24 }}>
          <IconButton label="Done" variant="primary" onClick={onClose}>Done</IconButton>
        </FlexRow>
      </ModalContent>

      {/* Background Color Picker Modal */}
      {bgPickerOpen && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          onClick={() => setBgPickerOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ColorPickerPopup
              color={{ red: bgColor.r, green: bgColor.g, blue: bgColor.b }}
              position={{ x: 0, y: 0 }}
              canDelete={false}
              onColorChange={handleBgColorFromPicker}
              onDelete={() => {}}
              onClose={() => setBgPickerOpen(false)}
            />
          </div>
        </div>,
        document.body
      )}
    </ModalOverlay>
  );
};

export default PaletteModal;
