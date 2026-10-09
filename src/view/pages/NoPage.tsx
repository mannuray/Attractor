import React from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { tokens } from "../../theme/tokens";
import { DocsHeader } from "../components/DocsHeader";
import { useDocumentMeta } from "../../seo/useDocumentMeta";
import { pageMetaFor } from "../../seo/meta";

const Page = styled.div`
  min-height: 100vh;
  background: ${p => p.theme.pageBg};
  color: ${p => p.theme.textHigh};
  font-family: ${tokens.font.ui};
`;
const Main = styled.main`
  max-width: 560px; margin: 0 auto; padding: 96px 24px; text-align: center;
  .code { display: block; font: 700 72px/1 ${tokens.font.mono}; color: ${p => p.theme.primary}; letter-spacing: -0.04em; }
  h1 { margin: 16px 0 8px; font: 600 24px/1.3 ${tokens.font.ui}; }
  p { margin: 0 0 28px; font: 400 15px/1.6 ${tokens.font.ui}; color: ${p => p.theme.textMid}; }
  nav { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  a {
    display: inline-flex; align-items: center; height: 40px; padding: 0 16px; border-radius: 10px; text-decoration: none;
    font: 500 14px ${tokens.font.ui}; color: ${p => p.theme.textHigh}; border: 1px solid ${p => p.theme.hairlineStrong};
  }
  a.primary { background: ${p => p.theme.primaryContainer}; color: ${p => p.theme.onPrimary}; border: none; font-weight: 600; }
`;

function NoPage() {
  const { pathname } = useLocation();
  useDocumentMeta(pageMetaFor(pathname === "/" ? "/404" : pathname));
  return (
    <Page>
      <DocsHeader />
      <Main>
        <span className="code">404</span>
        <h1>This page doesn&#39;t exist</h1>
        <p>The link may be old or mistyped. You can head back to the studio or browse the systems in Help &amp; About.</p>
        <nav aria-label="Where to go">
          <a className="primary" href="/">Open the studio</a>
          <a href="/info">Help &amp; About</a>
        </nav>
      </Main>
    </Page>
  );
}

export default NoPage;
