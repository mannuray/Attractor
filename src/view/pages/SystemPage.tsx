import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { DocsHeader } from "../components/DocsHeader";
import { getSystemPage, SYSTEM_PAGES, GROUP_LABELS, SystemPage as SystemPageData } from "../../content/systemPages";
import { getSystemMeta } from "../../attractors/catalog";
import { Icon } from "../../components/ui/Icon";
import { mobileQ } from "../../content/docPrimitives";
import { tokens } from "../../theme/tokens";
import NoPage from "./NoPage";
import { useDocumentMeta } from "../../seo/useDocumentMeta";
import { pageMetaFor } from "../../seo/meta";

const Page = styled.div`
  min-height: 100vh;
  background: ${p => p.theme.pageBg};
  color: ${p => p.theme.textHigh};
  font-family: ${tokens.font.ui};
`;
const Main = styled.main`
  max-width: 820px; margin: 0 auto; padding: 32px 24px 80px;
  ${mobileQ} { padding: 20px 16px 64px; }
`;
const Crumbs = styled.nav`
  margin-bottom: 16px;
  ol { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; font: 400 12px/1rem ${tokens.font.mono}; color: ${p => p.theme.textLow}; }
  li + li::before { content: "›"; margin-right: 6px; }
  a { color: ${p => p.theme.primary}; text-decoration: none; &:hover { text-decoration: underline; } }
`;
const H1 = styled.h1`
  margin: 0 0 8px; font: 700 40px/1.1 ${tokens.font.ui}; letter-spacing: -0.03em; color: ${p => p.theme.textHigh};
  ${mobileQ} { font-size: 30px; }
`;
const Lead = styled.p`margin: 0 0 24px; font: 400 17px/1.6 ${tokens.font.ui}; color: ${p => p.theme.textMid};`;
const Actions = styled.div`
  display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 28px;
  a {
    display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px; border-radius: 10px;
    text-decoration: none; font: 600 14px/1 ${tokens.font.ui};
    background: ${p => p.theme.primaryContainer}; color: ${p => p.theme.onPrimary}; box-shadow: ${p => p.theme.glowPrimary};
    &:hover { filter: brightness(1.1); }
  }
`;
const Related = styled.nav`
  margin-top: 40px; padding-top: 24px; border-top: 1px solid ${p => p.theme.hairline};
  h2 { margin: 0 0 14px; font: 600 11px/0.875rem ${tokens.font.mono}; letter-spacing: 0.08em; text-transform: uppercase; color: ${p => p.theme.textMid}; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
  a {
    display: block; padding: 14px 16px; border-radius: 12px; text-decoration: none;
    background: rgba(24, 27, 37, 0.6); border: 1px solid ${p => p.theme.hairline};
    color: ${p => p.theme.textHigh}; font: 500 15px/1.3 ${tokens.font.ui};
    span { display: block; margin-top: 4px; font: 400 11px ${tokens.font.mono}; color: ${p => p.theme.textLow}; }
    &:hover { border-color: ${p => p.theme.primaryBorder}; }
  }
`;

function related(page: SystemPageData) {
  const same = SYSTEM_PAGES.filter(p => p.group === page.group && p.slug !== page.slug);
  const i = SYSTEM_PAGES.indexOf(page);
  // Neighbours in Help order first, so related links differ from page to page.
  return same.sort((a, b) => Math.abs(SYSTEM_PAGES.indexOf(a) - i) - Math.abs(SYSTEM_PAGES.indexOf(b) - i)).slice(0, 4);
}

const SystemPage: React.FC = () => {
  const { slug = "" } = useParams();
  const page = getSystemPage(slug);
  useDocumentMeta(pageMetaFor(`/systems/${slug}`));
  if (!page) return <NoPage />;

  return (
    <Page>
      <DocsHeader />
      <Main>
        <Crumbs aria-label="Breadcrumb">
          <ol>
            <li><a href="/info">Help &amp; About</a></li>
            <li>{GROUP_LABELS[page.group]}</li>
            <li aria-current="page">{page.title}</li>
          </ol>
        </Crumbs>
        <H1>{page.title}</H1>
        <Lead>{page.description}</Lead>
        {page.systemIds.length > 0 && (
          <Actions>
            {page.systemIds.map(id => (
              <a key={id} href={`/?type=${id}`}>
                <Icon name="play_arrow" size={18} />
                {page.systemIds.length > 1 ? `Open ${getSystemMeta(id)?.label ?? id} in studio` : "Open in studio"}
              </a>
            ))}
          </Actions>
        )}
        <page.Body />
        <Related aria-label="Related systems">
          <h2>Related systems</h2>
          <ul>
            {related(page).map(r => (
              <li key={r.slug}><a href={`/systems/${r.slug}`}>{r.title}<span>{GROUP_LABELS[r.group]}</span></a></li>
            ))}
          </ul>
        </Related>
      </Main>
    </Page>
  );
};

export default SystemPage;
