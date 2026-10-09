import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { ModalOverlay, ModalContent, ModalHeader, ModalTitle, CloseButton } from "./ModalStyles";
import { Segmented } from "./ui/Segmented";
import { IconButton } from "./ui/IconButton";
import { Icon } from "./ui/Icon";
import { SectionLabel } from "../attractors/shared/styles";
import { tokens } from "../theme/tokens";

type Choice = "current" | 1080 | 1440 | 2160 | 4320;
const CHOICES: { value: Choice; label: string }[] = [
  { value: "current", label: "Current view" },
  { value: 1080, label: "1080 px" },
  { value: 1440, label: "1440 px" },
  { value: 2160, label: "2160 px (4K)" },
  { value: 4320, label: "4320 px (8K)" },
];

const Grid = styled.div`
  display: grid; gap: 16px;
  [role="radiogroup"] { grid-auto-flow: row; }
`;
const Hint = styled.p`margin: 0; font: 400 12px/1.5 ${tokens.font.ui}; color: ${p => p.theme.textMid};`;
const Footer = styled.div`
  display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; padding-top: 16px;
  border-top: 1px solid ${p => p.theme.hairline};
`;
const Progress = styled.div`
  height: 4px; border-radius: 2px; overflow: hidden; background: ${p => p.theme.surfaceHigh};
  &::after {
    content: ""; display: block; height: 100%; width: 40%; background: ${p => p.theme.primary};
    animation: slide 1.2s ease-in-out infinite;
  }
  @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
`;

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportCurrent: () => void;
  onExportSize: (size: number) => void;
  exporting: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExportCurrent, onExportSize, exporting }) => {
  const [choice, setChoice] = useState<Choice>(2160);
  const wasExporting = useRef(false);

  useEffect(() => {
    if (exporting) wasExporting.current = true;
    else if (wasExporting.current) { wasExporting.current = false; onClose(); }
  }, [exporting, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !exporting) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, exporting, onClose]);

  if (!isOpen) return null;

  const tryClose = () => { if (!exporting) onClose(); };
  const doExport = () => {
    if (exporting) return;
    if (choice === "current") { onExportCurrent(); onClose(); }
    else onExportSize(choice);
  };

  return createPortal(
    <ModalOverlay data-testid="modal-backdrop" onClick={tryClose}>
      <ModalContent role="dialog" aria-modal="true" aria-labelledby="export-title" onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle id="export-title">Export image</ModalTitle>
          <CloseButton aria-label="Close" onClick={tryClose} disabled={exporting}>×</CloseButton>
        </ModalHeader>
        <Grid>
          <div>
            <SectionLabel as="div">Resolution</SectionLabel>
            <Segmented<Choice> ariaLabel="Resolution" value={choice} onChange={setChoice} options={CHOICES} />
          </div>
          <Hint>
            {choice === "current"
              ? "Saves the canvas exactly as it is now."
              : `Re-renders a ${choice} × ${choice} PNG with the current parameters and palette.`}
          </Hint>
          {exporting && <div role="progressbar" aria-label="Exporting" aria-busy="true"><Progress /></div>}
        </Grid>
        <Footer>
          <IconButton label="Cancel" variant="soft" onClick={tryClose} disabled={exporting}>Cancel</IconButton>
          <IconButton label="Export PNG" variant="primary" onClick={doExport} disabled={exporting}>
            <Icon name="download" size={16} /> Export PNG
          </IconButton>
        </Footer>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default ExportModal;
