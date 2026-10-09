import styled from "styled-components";
import { tokens } from "../theme/tokens";

const mobile = `@media (max-width: ${tokens.breakpoint.mobileMax}px)`;

export const ModalOverlay = styled.div`
  position: fixed; inset: 0; z-index: ${tokens.z.modal};
  display: flex; align-items: center; justify-content: center; padding: 24px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 0.18s ease-out;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  ${mobile} { align-items: flex-end; padding: 0; }
`;

export const ModalContent = styled.div`
  width: 100%; max-width: 560px; max-height: 85vh; overflow-y: auto;
  padding: 20px 24px 24px;
  background: ${p => p.theme.glass2};
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid ${p => p.theme.hairlineStrong};
  border-radius: ${tokens.radius.lg};
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
  color: ${p => p.theme.textHigh};
  font-family: ${tokens.font.ui};
  animation: rise 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  @keyframes rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  ${mobile} {
    max-width: none; max-height: 92vh; border-radius: 20px 20px 0 0;
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }
`;

export const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid ${p => p.theme.hairline};
`;

export const ModalTitle = styled.h2`
  margin: 0; font: 600 16px ${tokens.font.ui}; color: ${p => p.theme.textHigh};
`;

export const CloseButton = styled.button`
  width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; cursor: pointer;
  background: transparent; border: 1px solid transparent; color: ${p => p.theme.textMid}; font-size: 20px;
  &:hover { background: rgba(255, 255, 255, 0.06); color: ${p => p.theme.textHigh}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  ${mobile} { width: 44px; height: 44px; }
`;
