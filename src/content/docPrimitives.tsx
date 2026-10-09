// Shared building blocks for documentation content (Help & About and per-system pages).
import React from "react";
import "katex/dist/katex.min.css";
import styled from "styled-components";
import { tokens } from "../theme/tokens";

export const mobileQ = `@media (max-width: ${tokens.breakpoint.mobileMax}px)`;

// ---- Content primitives (restyled to the Stitch "Help & About" design; content unchanged) ----

export const Section = styled.section`
  margin: 0 0 40px;
  scroll-margin-top: 72px;
`;

export const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${p => p.theme.hairline};
  font: 600 24px/2rem ${tokens.font.ui};
  letter-spacing: -0.02em;
  color: ${p => p.theme.textHigh};
  &::before {
    content: "";
    width: 4px;
    height: 20px;
    border-radius: 2px;
    background: ${p => p.theme.primary};
    box-shadow: ${p => p.theme.glowPrimary};
  }
  ${mobileQ} { font-size: 20px; }
`;

export const SubTitle = styled.h3`
  margin: 28px 0 12px;
  font: 600 11px/0.875rem ${tokens.font.mono};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${p => p.theme.primary};
`;

export const Paragraph = styled.p`
  margin: 0 0 16px;
  font: 400 15px/1.7 ${tokens.font.ui};
  color: ${p => p.theme.textMid};
  strong { color: ${p => p.theme.textHigh}; font-weight: 600; }
  .katex { color: ${p => p.theme.textHigh}; }
`;

export const MathBlock = styled.div`
  margin: 16px 0 20px;
  padding: 16px;
  border-radius: 12px;
  overflow-x: auto;
  background: ${p => p.theme.surfaceLowest};
  border: 1px solid ${p => p.theme.hairline};
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.35);

  .katex {
    font-size: 1.1em;
    color: ${p => p.theme.textHigh};
  }
`;

export const AttractorCard = styled.article`
  margin: 0 0 24px;
  padding: 24px;
  border-radius: 16px;
  background: rgba(24, 27, 37, 0.6);
  border: 1px solid ${p => p.theme.hairline};
  scroll-margin-top: 72px;
  transition: border-color 0.2s ease;
  &:hover { border-color: rgba(${p => p.theme.primaryRgb}, 0.25); }
  ${mobileQ} { padding: 16px; border-radius: 12px; }
`;

export const AttractorHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

export const lazyImg = { loading: "lazy" as const, decoding: "async" as const };

export const GalleryImage = styled.img.attrs(lazyImg)`
  display: block;
  width: 100%;
  max-width: 560px;
  height: auto;
  margin: 16px 0;
  border-radius: 12px;
  border: 1px solid ${p => p.theme.hairline};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
`;

export const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  margin: 16px 0 24px;
  ${mobileQ} { grid-template-columns: repeat(2, 1fr); gap: 12px; }
`;

export const GridImage = styled.img.attrs(lazyImg)`
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid ${p => p.theme.hairline};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  transition: transform 0.2s ease, border-color 0.2s ease;
  &:hover { transform: translateY(-2px); border-color: rgba(${p => p.theme.primaryRgb}, 0.4); }
`;

export const ImageLabel = styled.span`
  display: block;
  margin-top: 8px;
  text-align: center;
  font: 400 11px/0.875rem ${tokens.font.mono};
  color: ${p => p.theme.textMid};
`;

export const AttractorContent = styled.div`
  width: 100%;
  text-align: left;
`;

export const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const AttractorNameHeading = styled.h4`
  margin: 0 0 12px;
  font: 600 20px/1.75rem ${tokens.font.ui};
  letter-spacing: -0.015em;
  color: ${p => p.theme.textHigh};
  scroll-margin-top: 80px;
`;

// System headings carry an anchor id + marker so the navigation rail can list and link them.
export const AttractorName: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const text = typeof children === "string" ? children : "";
  return (
    <AttractorNameHeading id={text ? `system-${slug(text)}` : undefined} data-system={text || undefined}>
      {children}
    </AttractorNameHeading>
  );
};

export const UsageList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const UsageItem = styled.li`
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(24, 27, 37, 0.6);
  border: 1px solid ${p => p.theme.hairline};
  font: 400 14px/1.6 ${tokens.font.ui};
  color: ${p => p.theme.textMid};
  strong { display: block; margin-bottom: 2px; font: 600 15px/1.4 ${tokens.font.ui}; color: ${p => p.theme.textHigh}; }
`;

export const StepNumber = styled.span`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: ${p => p.theme.primarySoft};
  border: 1px solid ${p => p.theme.primaryBorder};
  font: 600 13px/1 ${tokens.font.mono};
  color: ${p => p.theme.primary};
`;

export const ParamList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

export const ParamBadge = styled.span`
  padding: 3px 8px;
  border-radius: 6px;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.hairline};
  font: 400 11px/1rem ${tokens.font.mono};
  color: ${p => p.theme.primary};
`;

export const CreditSection = styled.div`
  margin-top: 24px;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  background: rgba(24, 27, 37, 0.6);
  border: 1px solid ${p => p.theme.hairline};
`;

export const CreditLink = styled.a`
  color: ${p => p.theme.primary};
  font: 500 13px ${tokens.font.mono};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;
