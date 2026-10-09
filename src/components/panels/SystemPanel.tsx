import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { registry, AttractorCategory } from "../../attractors/registry";
import { AttractorType } from "../../attractors/shared/types";
import { SectionLabel } from "../../attractors/shared/styles";
import { Chip } from "../ui/Chip";
import { Icon } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

const CATEGORIES: AttractorCategory[] = ["Attractors", "Fractals", "IFS"];

const Chips = styled.div`display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;`;
const SearchWrap = styled.label`
  display: flex; align-items: center; gap: 8px;
  padding: 0 10px; min-height: 40px; margin-bottom: 8px;
  border-radius: 10px; border: 1px solid ${p => p.theme.hairline}; background: ${p => p.theme.surface};
  color: ${p => p.theme.textMid};
  &:focus-within { border-color: ${p => p.theme.focusBorder}; }
`;
const Search = styled.input`
  flex: 1; min-width: 0; background: transparent; border: none; outline: none;
  color: ${p => p.theme.textHigh}; font: 400 13px ${tokens.font.ui};
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { font-size: 16px; } /* avoid iOS zoom-on-focus */
`;
const List = styled.ul`list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px;`;
const Item = styled.li<{ $active: boolean }>`
  display: flex; align-items: center; justify-content: space-between;
  min-height: 40px; padding: 0 12px; border-radius: 8px; cursor: pointer;
  color: ${p => (p.$active ? p.theme.primary : p.theme.textHigh)};
  background: ${p => (p.$active ? p.theme.primarySoft : "transparent")};
  font: 500 13px ${tokens.font.ui};
  &:hover { background: rgba(255, 255, 255, 0.05); }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 44px; }
`;
const Cat = styled.span`font: 400 11px ${tokens.font.mono}; color: ${p => p.theme.textLow};`;

interface Props { value: AttractorType; onChange: (t: AttractorType) => void; onPicked?: () => void }

export const SystemPanel: React.FC<Props> = ({ value, onChange, onPicked }) => {
  const activeCategory = registry.get(value)?.category ?? "Attractors";
  const [category, setCategory] = useState<AttractorCategory>(activeCategory);
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q ? registry.getAll() : registry.getByCategory(category);
    return q ? pool.filter(m => m.label.toLowerCase().includes(q)) : pool;
  }, [category, query]);

  return (
    <div>
      <SectionLabel as="div">System</SectionLabel>
      <Chips>
        {CATEGORIES.map(c => (
          <Chip key={c} selected={!query && c === category} onClick={() => { setCategory(c); setQuery(""); }}>{c}</Chip>
        ))}
      </Chips>
      <SearchWrap>
        <Icon name="search" size={16} />
        <Search type="search" aria-label="Search systems" placeholder="Search systems"
          value={query} onChange={e => setQuery(e.target.value)} />
      </SearchWrap>
      <List role="listbox" aria-label="Systems">
        {items.map(m => (
          <Item key={m.id} role="option" aria-selected={m.id === value} $active={m.id === value}
            onClick={() => { onChange(m.id); onPicked?.(); }}>
            <span>{m.label}</span>
            {query && <Cat>{m.category}</Cat>}
          </Item>
        ))}
      </List>
    </div>
  );
};
