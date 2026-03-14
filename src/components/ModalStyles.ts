import styled from "styled-components";
import { GlassPanel, colors } from "../attractors/shared/styles";

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const ModalContent = styled(GlassPanel)`
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 24px;
  background: ${colors.bgPage};
  border: 1px solid ${colors.accentBorder};
  border-radius: 8px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), 0 0 20px ${colors.accentSubtle};
  transform-origin: center;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${colors.accentMuted};
    border-radius: 2px;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${colors.accentMuted};
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${colors.accent};
  font-family: 'JetBrains Mono', monospace;
  text-shadow: 0 0 8px ${colors.accentMuted};
`;

export const CloseButton = styled.button`
  background: transparent;
  border: 1px solid ${colors.accentBorder};
  color: ${colors.accentDim};
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.accentSubtle};
    border-color: ${colors.accent};
    color: white;
  }
`;
