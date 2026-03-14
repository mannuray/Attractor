import React, { lazy, Suspense, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { Color } from "../model-controller/Attractor/palette";
import { Field, Label, Input, Select, FlexRow, ButtonPrimary, colors } from "../attractors/shared/styles";
import { ColorPickerPopup, RGB } from "../view/components/colorbar";
import { ModalOverlay, ModalContent, ModalHeader, ModalTitle, CloseButton } from "./ModalStyles";

const ColorBar = lazy(() => import("../view/components/colorbar"));

const ColorBarWrapper = styled.div`
  margin-bottom: 24px;
  background: ${colors.darkerBg};
  padding: 12px;
  border-radius: 4px;
  border: 1px solid ${colors.accentMuted};
`;

const ColorPickerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${colors.darkerBg};
  padding: 10px;
  border-radius: 4px;
  border: 1px solid ${colors.accentBorder};
`;

const ColorPreview = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: ${props => props.$color};
  border: 1px solid ${colors.accentBorder};
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    border-color: ${colors.accent};
    box-shadow: 0 0 12px ${colors.accentSubtle};
  }
`;

const ColorValueLabel = styled.span`
  color: ${colors.accentLight};
  font-size: 11px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  
  &:hover {
    color: ${colors.accent};
    text-shadow: 0 0 8px ${colors.accentMuted};
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

  if (!isOpen) return null;

  const bgColorHex = `#${bgColor.r.toString(16).padStart(2, '0')}${bgColor.g.toString(16).padStart(2, '0')}${bgColor.b.toString(16).padStart(2, '0')}`;

  const handleBgColorFromPicker = (color: RGB) => {
    onBgColorChange({ r: color.red, g: color.green, b: color.blue });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Engine.Palette</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
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
          <Label>Signal Gamma ({palGamma.toFixed(2)})</Label>
          <Input
            type="range"
            min="0.1"
            max="2.5"
            step="0.01"
            value={palGamma}
            onChange={(e) => onGammaChange(parseFloat(e.target.value))}
            $editable
          />
        </Field>

        <Field>
          <Label>Normalize</Label>
          <Select
            value={palScale ? "dynamic" : "fixed"}
            onChange={(e) => onScaleModeChange(e.target.value === "dynamic")}
          >
            <option value="dynamic">Auto (Peak)</option>
            <option value="fixed">Manual (Gain)</option>
          </Select>
        </Field>

        {!palScale && (
          <Field>
            <Label>Gain Threshold</Label>
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
          <Label>Base.Canvas</Label>
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
          <ButtonPrimary onClick={onClose} style={{ width: '100px' }}>Commit</ButtonPrimary>
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
