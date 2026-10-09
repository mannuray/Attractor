import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import { Icon } from "../../components/ui/Icon";
import { tokens } from "../../theme/tokens";
import { mobileQ } from "../../content/docPrimitives";

// Top bar shared by the documentation pages (Help & About, system pages).
const TopBar = styled.header`
  position: sticky; top: 0; z-index: 30;
  height: 56px; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: ${p => p.theme.glassBar};
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid ${p => p.theme.hairline};
  .left { display: flex; align-items: center; gap: 16px; min-width: 0; }
  .brand { display: flex; align-items: center; gap: 10px; font: 600 16px ${tokens.font.ui}; white-space: nowrap; }
  .mark {
    width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; color: ${p => p.theme.primary};
    background: ${p => p.theme.primarySoft}; border: 1px solid ${p => p.theme.primaryBorder}; box-shadow: ${p => p.theme.glowPrimary};
  }
  .sep { width: 1px; height: 18px; background: ${p => p.theme.hairline}; }
  ${mobileQ} {
    height: 52px; padding: 0 12px;
    .brand .name, .sep { display: none; }
  }
`;

const BackButton = styled.button`
  display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 8px; cursor: pointer;
  background: rgba(39, 42, 51, 0.4); border: 1px solid ${p => p.theme.hairlineStrong};
  color: ${p => p.theme.textHigh}; font: 500 13px ${tokens.font.ui};
  &:hover { background: ${p => p.theme.surfaceHigh}; }
  ${mobileQ} { height: 40px; }
`;

const ThemeSelect = styled.select`
  height: 32px; border-radius: 8px; padding: 0 8px; cursor: pointer;
  background: transparent; color: ${p => p.theme.textMid}; border: 1px solid ${p => p.theme.hairline};
  font: 400 11px ${tokens.font.mono};
  option { background: ${p => p.theme.surface}; color: ${p => p.theme.textHigh}; }
`;


export const DocsHeader: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme, setTheme, availableThemes } = useTheme();
  return (
    <TopBar>
      <div className="left">
        <div className="brand">
          <span className="mark"><Icon name="all_inclusive" size={16} /></span>
          <span className="name">Chaos Iterator</span>
        </div>
        <span className="sep" />
        <BackButton type="button" onClick={() => navigate("/")}>
          <Icon name="arrow_back" size={16} /> Back to studio
        </BackButton>
      </div>
      <ThemeSelect aria-label="Theme" value={currentTheme} onChange={e => setTheme(e.target.value)}>
        {availableThemes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </ThemeSelect>
    </TopBar>
  );
};
