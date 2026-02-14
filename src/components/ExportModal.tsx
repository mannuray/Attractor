import React from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { colors, GlassPanel } from "../attractors/shared/styles";
import { ModalOverlay, ModalHeader, ModalTitle, CloseButton } from "./ModalStyles";

const ExportModalContent = styled(GlassPanel)`
  width: 320px;
  padding: 24px;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OptionRow = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: ${colors.darkBg};
  border: 1px solid ${colors.accentBorder};
  border-radius: 10px;
  color: ${colors.white};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${colors.darkerBg};
    border-color: ${colors.accentBorderLight};
  }
`;

const OptionLabel = styled.span``;

const OptionDetail = styled.span`
  font-size: 12px;
  color: ${colors.accentLight};
`;

const ExportingIndicator = styled.div`
  text-align: center;
  padding: 16px;
  color: ${colors.accent};
  font-size: 14px;
  font-weight: 500;
`;

interface ExportOption {
  label: string;
  size: number | "current";
  detail: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  { label: "Current Size", size: "current", detail: "Fast" },
  { label: "1080 x 1080", size: 1080, detail: "1080p" },
  { label: "2048 x 2048", size: 2048, detail: "2K" },
  { label: "4096 x 4096", size: 4096, detail: "4K" },
  { label: "8192 x 8192", size: 8192, detail: "8K" },
];

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportCurrent: () => void;
  onExportSize: (size: number) => void;
  exporting: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExportCurrent,
  onExportSize,
  exporting,
}) => {
  // Track whether we initiated a sized export so we can auto-close on completion
  const wasExporting = React.useRef(false);

  React.useEffect(() => {
    if (exporting) {
      wasExporting.current = true;
    } else if (wasExporting.current) {
      // Export just finished — auto-close
      wasExporting.current = false;
      onClose();
    }
  }, [exporting, onClose]);

  if (!isOpen) return null;

  const handleClick = (option: ExportOption) => {
    if (exporting) return;
    if (option.size === "current") {
      onExportCurrent();
      onClose();
    } else {
      onExportSize(option.size);
    }
  };

  const handleOverlayClick = () => {
    if (!exporting) onClose();
  };

  return createPortal(
    <ModalOverlay onClick={handleOverlayClick}>
      <ExportModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Export Image</ModalTitle>
          <CloseButton onClick={handleOverlayClick}>&times;</CloseButton>
        </ModalHeader>

        {exporting ? (
          <ExportingIndicator>Rendering...</ExportingIndicator>
        ) : (
          <OptionList>
            {EXPORT_OPTIONS.map((opt) => (
              <OptionRow
                key={String(opt.size)}
                onClick={() => handleClick(opt)}
              >
                <OptionLabel>{opt.label}</OptionLabel>
                <OptionDetail>{opt.detail}</OptionDetail>
              </OptionRow>
            ))}
          </OptionList>
        )}
      </ExportModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default ExportModal;
