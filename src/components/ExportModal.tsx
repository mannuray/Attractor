import React from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { colors, GlassPanel } from "../attractors/shared/styles";
import { ModalOverlay, ModalHeader, ModalTitle, CloseButton } from "./ModalStyles";

const ExportModalContent = styled(GlassPanel)`
  width: 320px;
  padding: 24px;
  background: ${colors.bgPage};
  border: 1px solid ${colors.accentBorder};
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), 0 0 20px ${colors.accentSubtle};
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const OptionRow = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: ${colors.darkerBg};
  border: 1px solid ${colors.accentMuted};
  border-radius: 4px;
  color: ${colors.white};
  font-size: 12px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${colors.accentSubtle};
    border-color: ${colors.accent};
    transform: translateX(4px);
    color: ${colors.accent};
  }

  &:active {
    transform: translateX(2px);
  }
`;

const OptionLabel = styled.span``;

const OptionDetail = styled.span`
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${colors.accentDim};
`;

const ExportingIndicator = styled.div`
  text-align: center;
  padding: 24px 16px;
  color: ${colors.accent};
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: 'JetBrains Mono', monospace;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;

  &::before {
    content: "◈";
    font-size: 24px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0% { opacity: 0.4; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); text-shadow: 0 0 15px ${colors.accent}; }
    100% { opacity: 0.4; transform: scale(0.8); }
  }
`;

interface ExportOption {
  label: string;
  size: number | "current";
  detail: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  { label: "VIEWPORT.STREAM", size: "current", detail: "RAW" },
  { label: "EXPORT.HD", size: 1080, detail: "1080P" },
  { label: "EXPORT.QHD", size: 1440, detail: "1440P" },
  { label: "EXPORT.UHD", size: 2160, detail: "2160P" },
  { label: "EXPORT.MASTER", size: 4320, detail: "4320P" },
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
  const wasExporting = React.useRef(false);

  React.useEffect(() => {
    if (exporting) {
      wasExporting.current = true;
    } else if (wasExporting.current) {
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
      const size = typeof option.size === 'number' ? option.size : 1080;
      onExportSize(size);
    }
  };

  const handleOverlayClick = () => {
    if (!exporting) onClose();
  };

  return createPortal(
    <ModalOverlay onClick={handleOverlayClick}>
      <ExportModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>System.Export</ModalTitle>
          <CloseButton onClick={handleOverlayClick}>&times;</CloseButton>
        </ModalHeader>

        {exporting ? (
          <ExportingIndicator>WRITING_DATA_TO_DISK...</ExportingIndicator>
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
