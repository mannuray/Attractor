import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { registry, AttractorCategory } from "../../attractors/registry";
import { AttractorType } from "../../attractors/shared/types";
import { SectionLabel } from "../../attractors/shared/styles";
import { Icon } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

const CATEGORIES: AttractorCategory[] = ["Attractors", "Fractals", "IFS"];

const Head = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;`;
const Count = styled.span`font: 400 11px/0.875rem ${tokens.font.mono}; color: ${p => p.theme.primary};`;
const Chips = styled.div`display: flex; gap: 6px; margin-bottom: 8px;`;
const CatButton = styled.button<{ $active: boolean }>`
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  min-height: 28px; padding: 4px 8px; border-radius: 6px; cursor: pointer;
  font: 500 13px/1.25rem ${tokens.font.ui};
  background: ${p => (p.$active ? `rgba(${p.theme.primaryRgb}, 0.15)` : p.theme.surface)};
  border: 1px solid ${p => (p.$active ? p.theme.primaryBorder : p.theme.hairline)};
  color: ${p => (p.$active ? p.theme.primary : p.theme.textMid)};
  &:hover { background: ${p => (p.$active ? `rgba(${p.theme.primaryRgb}, 0.15)` : p.theme.surfaceHigh)}; }
  &::before {
    content: ""; width: 6px; height: 6px; border-radius: 50%;
    display: ${p => (p.$active ? "block" : "none")};
    background: ${p => p.theme.primary}; box-shadow: ${p => p.theme.glowPrimary};
  }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 40px; }
`;
const SearchWrap = styled.label`
  display: flex; align-items: center; gap: 8px; padding: 0 10px; min-height: 34px; margin-bottom: 6px;
  border-radius: 8px; border: 1px solid ${p => p.theme.hairline}; background: ${p => p.theme.surfaceLowest};
  color: ${p => p.theme.textMid};
  &:focus-within { border-color: ${p => p.theme.focusBorder}; }
`;
const Search = styled.input`
  flex: 1; min-width: 0; background: transparent; border: none; outline: none;
  color: ${p => p.theme.textHigh}; font: 400 13px ${tokens.font.ui};
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { font-size: 16px; }
`;
const List = styled.ul<{ $maxHeight?: number }>`
  list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px;
  ${p => p.$maxHeight ? `max-height: ${p.$maxHeight}px; overflow-y: auto; padding-right: 2px;` : ""}
`;
const Item = styled.button<{ $active: boolean }>`
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px;
  min-height: 30px; padding: 6px 10px; border-radius: 8px; cursor: pointer; text-align: left;
  font: 400 13px/1.25rem ${tokens.font.ui};
  background: ${p => (p.$active ? p.theme.primarySoft : "transparent")};
  border: 1px solid ${p => (p.$active ? `rgba(${p.theme.primaryRgb}, 0.3)` : "transparent")};
  color: ${p => (p.$active ? p.theme.primary : p.theme.textHigh)};
  &:hover { background: ${p => (p.$active ? p.theme.primarySoft : p.theme.surface)}; }
  &:focus-visible { outline: 2px solid ${p => p.theme.focusBorder}; outline-offset: 1px; }
  .meta { font: 400 11px ${tokens.font.mono}; color: ${p => p.theme.textLow}; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 44px; }
`;

interface Props {
  value: AttractorType;
  onChange: (t: AttractorType) => void;
  onPicked?: () => void;
  showSearch?: boolean;
  /** Cap the list height (scrolls inside), e.g. in the inspector. */
  listMaxHeight?: number;
}

export const SystemPanel: React.FC<Props> = ({ value, onChange, onPicked, showSearch = true, listMaxHeight }) => {
  const activeCategory = registry.get(value)?.category ?? "Attractors";
  const [category, setCategory] = useState<AttractorCategory>(activeCategory);
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? registry.getAll().filter(m => m.label.toLowerCase().includes(q)) : registry.getByCategory(category);
  }, [category, query]);

  return (
    <div>
      <Head>
        <SectionLabel as="div" style={{ margin: 0 }}>System category</SectionLabel>
        <Count>{registry.getByCategory(category).length} systems</Count>
      </Head>
      <Chips>
        {CATEGORIES.map(c => (
          <CatButton key={c} type="button" aria-pressed={!query && c === category} $active={!query && c === category}
            onClick={() => { setCategory(c); setQuery(""); }}>{c}</CatButton>
        ))}
      </Chips>
      {showSearch && (
        <SearchWrap>
          <Icon name="search" size={16} />
          <Search type="search" aria-label="Search systems" placeholder="Search systems"
            value={query} onChange={e => setQuery(e.target.value)} />
        </SearchWrap>
      )}
      <List aria-label="Systems" $maxHeight={listMaxHeight}>
        {items.map(m => (
          <li key={m.id}>
            <Item type="button" aria-current={m.id === value ? "true" : undefined} $active={m.id === value}
              onClick={() => { onChange(m.id); onPicked?.(); }}>
              <span>{m.label}</span>
              {m.id === value ? <Icon name="check" size={14} /> : query ? <span className="meta">{m.category}</span> : null}
            </Item>
          </li>
        ))}
      </List>
    </div>
  );
};
