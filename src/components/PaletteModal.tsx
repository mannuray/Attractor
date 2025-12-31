import React, { lazy, Suspense, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { Color } from "../model-controller/Attractor/palette";
import { GlassPanel, Field, Label, Input, Select, FlexRow, ButtonPrimary } from "../attractors/shared/styles";
import { ColorPickerPopup, RGB } from "../view/components/colorbar";

// Lazy load ColorBar
const ColorBar = lazy(() => import("../view/components/colorbar"));

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(GlassPanel)`
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 180, 120, 0.9);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 180, 120, 0.7);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    color: rgba(255, 180, 120, 1);
  }
`;

const ColorBarWrapper = styled.div`
  margin-bottom: 20px;
`;

const ColorPickerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ColorPreview = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$color};
  border: 2px solid rgba(255, 180, 120, 0.3);
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: scale(1.05);
    border-color: rgba(255, 180, 120, 0.6);
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
          <ModalTitle>Palette Editor</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ColorBarWrapper>
          <Suspense fallback={<div style={{ height: 60, background: "rgba(0,0,0,0.3)", borderRadius: 8 }} />}>
            <ColorBar
              palletteArg={paletteData}
              changePalletCallback={onPaletteChange}
            />
          </Suspense>
        </ColorBarWrapper>

        <Field>
          <Label>Gamma ({palGamma.toFixed(2)})</Label>
          <Input
            type="range"
            min="0.1"
            max="2"
            step="0.01"
            value={palGamma}
            onChange={(e) => onGammaChange(parseFloat(e.target.value))}
            $editable
          />
        </Field>

        <Field>
          <Label>Scale Mode</Label>
          <Select
            value={palScale ? "dynamic" : "fixed"}
            onChange={(e) => onScaleModeChange(e.target.value === "dynamic")}
          >
            <option value="dynamic">Dynamic (Max Hits)</option>
            <option value="fixed">Fixed Threshold</option>
          </Select>
        </Field>

        {!palScale && (
          <Field>
            <Label>Fixed Max Hits</Label>
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
          <Label>Background Color (0 hits)</Label>
          <ColorPickerWrapper>
            <ColorPreview
              $color={bgColorHex}
              onClick={() => setBgPickerOpen(true)}
              style={{ cursor: "pointer" }}
            />
            <span
              style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}
              onClick={() => setBgPickerOpen(true)}
            >
              {bgColorHex.toUpperCase()} — Click to edit
            </span>
          </ColorPickerWrapper>
        </Field>

        <FlexRow $justify="flex-end" style={{ marginTop: 20 }}>
          <ButtonPrimary onClick={onClose}>Done</ButtonPrimary>
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
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
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
