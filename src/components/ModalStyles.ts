import styled from "styled-components";
import { GlassPanel, colors } from "../attractors/shared/styles";

export const ModalOverlay = styled.div`
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

export const ModalContent = styled(GlassPanel)`
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 180, 120, 0.9);
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${colors.accentLight};
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    color: ${colors.accent};
  }
`;
